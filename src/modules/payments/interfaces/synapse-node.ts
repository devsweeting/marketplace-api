import { IncomingHttpHeaders } from 'http';
import { Client, User } from 'synapsenode';

export interface IOAuthHeaders extends IncomingHttpHeaders {
  fingerprint: string;
  ip_address: string;
}

export interface ISynapseUserClient extends User {
  data: { _id: string };
  headerObj: IOAuthHeaders;
  client: Client;
}

export type IPermissionsScope =
  | 'USER|PATCH'
  | 'USER|GET'
  | 'NODES|POST'
  | 'NODES|GET'
  | 'NODE|GET'
  | 'NODE|PATCH'
  | 'NODE|DELETE'
  | 'TRANS|POST'
  | 'TRANS|GET'
  | 'TRAN|GET'
  | 'TRAN|PATCH'
  | 'TRAN|DELETE'
  | 'SUBNETS|POST'
  | 'SUBNETS|GET'
  | 'SUBNET|GET'
  | 'SUBNET|PATCH'
  | 'STATEMENTS|GET'
  | 'STATEMENT|GET'
  | 'STATEMENTS|POST'
  | 'CONVERSATIONS|POST'
  | 'CONVERSATIONS|GET'
  | 'CONVERSATION|GET'
  | 'CONVERSATION|PATCH'
  | 'MESSAGES|POST'
  | 'MESSAGES|GET';

export interface IGetOAuthHeadersResponse {
  client_id: string;
  client_name: string;
  expires_at: string;
  expires_in: string;
  oauth_key: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: IPermissionsScope[];
  user_id: string;
}
