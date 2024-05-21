DOMAIN="laf.mediacloud.imgo.tv"
EXTERNAL_HTTP_SCHEMA="https"
NAMESPACE="laf-system"
PASSWD_OR_SECRET="642efjra2m6iq6oz2dr9hpzcs6f2n1im"
ENABLE_MONITOR=false

# *************** Deployments **************** #

## 0. create namespace
kubectl create namespace ${NAMESPACE} || true

## 1. install mongodb
set -e
set -x

sed "s/\$CAPACITY/${DB_PV_SIZE:-5Gi}/g" mongodb.yaml | kubectl apply -n ${NAMESPACE} -f -
kubectl wait --for=condition=Ready --timeout=120s cluster.apps.kubeblocks.io/mongodb -n ${NAMESPACE}

DB_USERNAME=$(kubectl get secret -n ${NAMESPACE} mongodb-conn-credential -ojsonpath='{.data.username}' | base64 -d)
DB_PASSWORD=$(kubectl get secret -n ${NAMESPACE} mongodb-conn-credential -ojsonpath='{.data.password}' | base64 -d)
DB_ENDPOINT=$(kubectl get secret -n ${NAMESPACE} mongodb-conn-credential -ojsonpath='{.data.headlessEndpoint}' | base64 -d)
DATABASE_URL="mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}/sys_db?authSource=admin&replicaSet=mongodb-mongodb&w=majority"


## 3. install minio
MINIO_ROOT_ACCESS_KEY=mediacloud
MINIO_ROOT_SECRET_KEY="!W5v;'qNzo~J)Rk%"
MINIO_DOMAIN=s3.mediacloud.imgo.tv
MINIO_EXTERNAL_ENDPOINT="https://s3.mediacloud.imgo.tv"
MINIO_INTERNAL_ENDPOINT="https://s3.mediacloud.imgo.tv"


## 4. install laf-server
SERVER_JWT_SECRET=$PASSWD_OR_SECRET
RUNTIME_EXPORTER_SECRET=$PASSWD_OR_SECRET
helm install server -n ${NAMESPACE} \
    --set databaseUrl=${DATABASE_URL} \
    --set jwt.secret=${SERVER_JWT_SECRET} \
    --set apiServerHost=api.${DOMAIN} \
    --set apiServerUrl=${EXTERNAL_HTTP_SCHEMA}://api.${DOMAIN} \
    --set siteName=${DOMAIN} \
    --set default_region.fixed_namespace=${NAMESPACE} \
    --set default_region.database_url=${DATABASE_URL} \
    --set default_region.minio_domain=${MINIO_DOMAIN} \
    --set default_region.minio_external_endpoint=${MINIO_EXTERNAL_ENDPOINT} \
    --set default_region.minio_internal_endpoint=${MINIO_INTERNAL_ENDPOINT} \
    --set default_region.minio_root_access_key=${MINIO_ROOT_ACCESS_KEY} \
    --set default_region.minio_root_secret_key=${MINIO_ROOT_SECRET_KEY} \
    --set default_region.runtime_domain=${DOMAIN} \
    --set default_region.website_domain=${DOMAIN} \
    --set default_region.tls.enabled=false \
    ./charts/laf-server

## 5. install laf-web
helm install web -n ${NAMESPACE} \
    --set domain=${DOMAIN} \
    ./charts/laf-web
