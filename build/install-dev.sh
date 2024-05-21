DOMAIN="laf.test.mediacloud.imgo.tv"
EXTERNAL_HTTP_SCHEMA="http"
NAMESPACE="laf-system"
PASSWD_OR_SECRET="642efjra2m6iq6oz2dr9hpzcs6f2n1im"
ENABLE_MONITOR=false

# *************** Deployments **************** #

## 0. create namespace
kubectl create namespace ${NAMESPACE} || true

## 1. install mongodb
DATABASE_URL="mongodb://10.1.172.163:27017/sys_db?replicaSet=myReplicaSet&w=majority"


## 3. install minio
MINIO_ROOT_ACCESS_KEY=minioadmin
MINIO_ROOT_SECRET_KEY=minioadmin
MINIO_DOMAIN=10.200.20.120
MINIO_EXTERNAL_ENDPOINT="http://10.200.20.120:9000"
MINIO_INTERNAL_ENDPOINT="http://10.200.20.120:9000"


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
