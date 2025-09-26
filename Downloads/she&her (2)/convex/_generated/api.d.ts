/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _data from "../_data.js";
import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as consultationMessages from "../consultationMessages.js";
import type * as consultations from "../consultations.js";
import type * as contracts from "../contracts.js";
import type * as demoData from "../demoData.js";
import type * as providers from "../providers.js";
import type * as userProfiles from "../userProfiles.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  _data: typeof _data;
  appointments: typeof appointments;
  auth: typeof auth;
  consultationMessages: typeof consultationMessages;
  consultations: typeof consultations;
  contracts: typeof contracts;
  demoData: typeof demoData;
  providers: typeof providers;
  userProfiles: typeof userProfiles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
