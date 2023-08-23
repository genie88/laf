// @ts-ignore
/* eslint-disable */
///////////////////////////////////////////////////////////////////////
//                                                                   //
// this file is autogenerated by service-generate                    //
// do not edit this file manually                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
/// <reference path = "api-auto.d.ts" />
import request from "@/utils/request";
import useGlobalStore from "@/pages/globalStore";

/**
 * Update avatar of user
 */
export async function UserControllerUpdateAvatar(
  params: Paths.UserControllerUpdateAvatar.BodyParameters,
): Promise<{
  error: string;
  data: Definitions.UserWithProfile;
}> {
  // /v1/user/avatar
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || "",
    ...params,
  };
  return request(`/v1/user/avatar`, {
    method: "POST",
    data: params,
  });
}

/**
 * Get avatar of user
 */
export async function UserControllerGetAvatar(
  params: Paths.UserControllerGetAvatar.BodyParameters,
): Promise<{
  error: string;
  data: Paths.UserControllerGetAvatar.Responses;
}> {
  // /v1/user/avatar/{uid}
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || "",
    ...params,
  };
  return request(`/v1/user/avatar/${_params.uid}`, {
    method: "GET",
    params: params,
  });
}

/**
 * Bind phone
 */
export async function UserControllerBindPhone(params: Definitions.BindPhoneDto): Promise<{
  error: string;
  data: Definitions.UserWithProfile;
}> {
  // /v1/user/bind/phone
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || "",
    ...params,
  };
  return request(`/v1/user/bind/phone`, {
    method: "POST",
    data: params,
  });
}

/**
 * Bind email
 */
export async function UserControllerBindEmail(params: Definitions.BindEmailDto): Promise<{
  error: string;
  data: Definitions.UserWithProfile;
}> {
  // /v1/user/bind/email
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || "",
    ...params,
  };
  return request(`/v1/user/bind/email`, {
    method: "POST",
    data: params,
  });
}

/**
 * Bind username
 */
export async function UserControllerBindUsername(params: Definitions.BindUsernameDto): Promise<{
  error: string;
  data: Definitions.UserWithProfile;
}> {
  // /v1/user/bind/username
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || "",
    ...params,
  };
  return request(`/v1/user/bind/username`, {
    method: "POST",
    data: params,
  });
}

/**
 * Get current user profile
 */
export async function UserControllerGetProfile(
  params: Paths.UserControllerGetProfile.BodyParameters,
): Promise<{
  error: string;
  data: Definitions.UserWithProfile;
}> {
  // /v1/user/profile
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || "",
    ...params,
  };
  return request(`/v1/user/profile`, {
    method: "GET",
    params: params,
  });
}