// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.5
//   protoc               v4.25.3
// source: session.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import {
  type CallOptions,
  type ChannelCredentials,
  Client,
  type ClientOptions,
  type ClientUnaryCall,
  type handleUnaryCall,
  makeGenericClientConstructor,
  type Metadata,
  type ServiceError,
  type UntypedServiceImplementation,
} from "@grpc/grpc-js";

export const protobufPackage = "session";

export interface CreateSessionRequest {
  userId: string;
  ip: string;
  userAgent: string;
}

export interface CreateSessionResponse {
  refreshToken: string;
}

function createBaseCreateSessionRequest(): CreateSessionRequest {
  return { userId: "", ip: "", userAgent: "" };
}

export const CreateSessionRequest: MessageFns<CreateSessionRequest> = {
  encode(message: CreateSessionRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    if (message.ip !== "") {
      writer.uint32(18).string(message.ip);
    }
    if (message.userAgent !== "") {
      writer.uint32(26).string(message.userAgent);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CreateSessionRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateSessionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.userId = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.ip = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.userAgent = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateSessionRequest {
    return {
      userId: isSet(object.userId) ? globalThis.String(object.userId) : "",
      ip: isSet(object.ip) ? globalThis.String(object.ip) : "",
      userAgent: isSet(object.userAgent) ? globalThis.String(object.userAgent) : "",
    };
  },

  toJSON(message: CreateSessionRequest): unknown {
    const obj: any = {};
    if (message.userId !== "") {
      obj.userId = message.userId;
    }
    if (message.ip !== "") {
      obj.ip = message.ip;
    }
    if (message.userAgent !== "") {
      obj.userAgent = message.userAgent;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateSessionRequest>, I>>(base?: I): CreateSessionRequest {
    return CreateSessionRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateSessionRequest>, I>>(object: I): CreateSessionRequest {
    const message = createBaseCreateSessionRequest();
    message.userId = object.userId ?? "";
    message.ip = object.ip ?? "";
    message.userAgent = object.userAgent ?? "";
    return message;
  },
};

function createBaseCreateSessionResponse(): CreateSessionResponse {
  return { refreshToken: "" };
}

export const CreateSessionResponse: MessageFns<CreateSessionResponse> = {
  encode(message: CreateSessionResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.refreshToken !== "") {
      writer.uint32(10).string(message.refreshToken);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CreateSessionResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateSessionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.refreshToken = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateSessionResponse {
    return { refreshToken: isSet(object.refreshToken) ? globalThis.String(object.refreshToken) : "" };
  },

  toJSON(message: CreateSessionResponse): unknown {
    const obj: any = {};
    if (message.refreshToken !== "") {
      obj.refreshToken = message.refreshToken;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateSessionResponse>, I>>(base?: I): CreateSessionResponse {
    return CreateSessionResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateSessionResponse>, I>>(object: I): CreateSessionResponse {
    const message = createBaseCreateSessionResponse();
    message.refreshToken = object.refreshToken ?? "";
    return message;
  },
};

export type SessionServiceService = typeof SessionServiceService;
export const SessionServiceService = {
  createSession: {
    path: "/session.SessionService/CreateSession",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateSessionRequest): Buffer => Buffer.from(CreateSessionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer): CreateSessionRequest => CreateSessionRequest.decode(value),
    responseSerialize: (value: CreateSessionResponse): Buffer =>
      Buffer.from(CreateSessionResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer): CreateSessionResponse => CreateSessionResponse.decode(value),
  },
} as const;

export interface SessionServiceServer extends UntypedServiceImplementation {
  createSession: handleUnaryCall<CreateSessionRequest, CreateSessionResponse>;
}

export interface SessionServiceClient extends Client {
  createSession(
    request: CreateSessionRequest,
    callback: (error: ServiceError | null, response: CreateSessionResponse) => void,
  ): ClientUnaryCall;
  createSession(
    request: CreateSessionRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateSessionResponse) => void,
  ): ClientUnaryCall;
  createSession(
    request: CreateSessionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateSessionResponse) => void,
  ): ClientUnaryCall;
}

export const SessionServiceClient = makeGenericClientConstructor(
  SessionServiceService,
  "session.SessionService",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): SessionServiceClient;
  service: typeof SessionServiceService;
  serviceName: string;
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
