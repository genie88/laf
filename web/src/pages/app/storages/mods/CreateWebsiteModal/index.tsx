import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { MoreIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import { BUCKET_POLICY_TYPE, BUCKET_STATUS } from "@/constants";

import {
  useWebsiteCreateMutation,
  useWebsiteDeleteMutation,
  useWebSiteUpdateMutation,
} from "../../service";
import useStorageStore from "../../store";

import SiteStatus from "./SiteStatus";

function CreateWebsiteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, getOrigin } = useStorageStore();
  const { register, setFocus, handleSubmit, reset } = useForm<{ domain: string }>();
  const { t } = useTranslation();
  const createWebsiteMutation = useWebsiteCreateMutation();
  const deleteWebsiteMutation = useWebsiteDeleteMutation();
  const updateWebsiteMutation = useWebSiteUpdateMutation();
  const toast = useToast();
  const cnameDomain = currentStorage?.websiteHosting?.domain;

  return (
    <>
      {currentStorage?.websiteHosting &&
      currentStorage.websiteHosting.state === BUCKET_STATUS.Active ? (
        <div className="flex">
          <span className="font-semibold mr-2">{t("StoragePanel.CurrentDomain")}</span>
          <Link
            className="cursor-pointer mr-2"
            href={getOrigin(currentStorage?.websiteHosting?.domain)}
            isExternal
          >
            {currentStorage?.websiteHosting?.domain}
          </Link>

          <SiteStatus />

          <Menu>
            <MenuButton className="ml-2 -mt-[2px]">
              <MoreIcon fontSize={10} />
            </MenuButton>
            <MenuList minWidth="100px">
              <MenuItem
                onClick={() => {
                  if (currentStorage?.websiteHosting?.state === BUCKET_STATUS.Active) {
                    onOpen();
                    reset({});
                    setTimeout(() => {
                      setFocus("domain");
                    }, 0);
                  }
                }}
              >
                {t("StoragePanel.CustomDomain")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  deleteWebsiteMutation.mutateAsync({
                    id: currentStorage?.websiteHosting?.id,
                  });
                }}
              >
                {t("StoragePanel.CancelHost")}
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      ) : (
        <Button
          size="xs"
          variant={"secondary"}
          style={{ borderRadius: "1rem" }}
          disabled={currentStorage === undefined}
          onClick={() => {
            if (currentStorage?.policy === BUCKET_POLICY_TYPE.private) {
              toast({
                status: "warning",
                position: "top",
                title: t("StoragePanel.editHostTip"),
              });
              return;
            }
            createWebsiteMutation.mutateAsync({
              bucketName: currentStorage && currentStorage.name,
              state: BUCKET_STATUS.Active,
            });
          }}
        >
          {t("StoragePanel.websiteHost")}
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.CustomDomain")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              {currentStorage?.policy === BUCKET_POLICY_TYPE.private ? (
                <p className="text-error-500 font-semibold">{t("StoragePanel.editHostTip")}</p>
              ) : null}
              <FormControl>
                <FormLabel>CNAME</FormLabel>
                <InputGroup size="sm">
                  <Input variant="filled" value={cnameDomain} readOnly />
                  <InputRightAddon
                    children={<CopyText text={cnameDomain} className="cursor-pointer" />}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="domain">{t("StoragePanel.domain")}</FormLabel>
                <Input
                  {...register("domain", {
                    required: true,
                  })}
                  variant="filled"
                  placeholder={String(t("StoragePanel.domainTip"))}
                />
                <p className="mt-2 text-grayModern-600">
                  {t("StoragePanel.cnameHostPreTip")}
                  <span className="mx-2 whitespace-nowrap">{cnameDomain}</span>,
                  {t("StoragePanel.cnameHostSuffixTip")}
                </p>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              isLoading={updateWebsiteMutation.isLoading}
              onClick={handleSubmit(async (value) => {
                const res: any = await updateWebsiteMutation.mutateAsync({
                  id: currentStorage?.websiteHosting.id,
                  domain: value.domain,
                });
                if (res.data) {
                  onClose();
                }
              })}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateWebsiteModal;
