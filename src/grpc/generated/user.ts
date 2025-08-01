// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.5
//   protoc               v4.25.3
// source: user.proto

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
import { Timestamp } from "./google/protobuf/timestamp";

export const protobufPackage = "auth";

export interface UserInfoRequest {
  userId: string;
}

export interface UserInfoResponse {
  id: string;
  name: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  plan: string;
  profileImage: string;
}

function createBaseUserInfoRequest(): UserInfoRequest {
  return { userId: "" };
}

export const UserInfoRequest: MessageFns<UserInfoRequest> = {
  encode(message: UserInfoRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): UserInfoRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserInfoRequest();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserInfoRequest {
    return { userId: isSet(object.userId) ? globalThis.String(object.userId) : "" };
  },

  toJSON(message: UserInfoRequest): unknown {
    const obj: any = {};
    if (message.userId !== "") {
      obj.userId = message.userId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UserInfoRequest>, I>>(base?: I): UserInfoRequest {
    return UserInfoRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UserInfoRequest>, I>>(object: I): UserInfoRequest {
    const message = createBaseUserInfoRequest();
    message.userId = object.userId ?? "";
    return message;
  },
};

function createBaseUserInfoResponse(): UserInfoResponse {
  return { id: "", name: "", createdAt: undefined, updatedAt: undefined, plan: "", profileImage: "" };
}

export const UserInfoResponse: MessageFns<UserInfoResponse> = {
  encode(message: UserInfoResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).join();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(34).fork()).join();
    }
    if (message.plan !== "") {
      writer.uint32(42).string(message.plan);
    }
    if (message.profileImage !== "") {
      writer.uint32(50).string(message.profileImage);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): UserInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.plan = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.profileImage = reader.string();
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

  fromJSON(object: any): UserInfoResponse {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined,
      plan: isSet(object.plan) ? globalThis.String(object.plan) : "",
      profileImage: isSet(object.profileImage) ? globalThis.String(object.profileImage) : "",
    };
  },

  toJSON(message: UserInfoResponse): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    if (message.updatedAt !== undefined) {
      obj.updatedAt = message.updatedAt.toISOString();
    }
    if (message.plan !== "") {
      obj.plan = message.plan;
    }
    if (message.profileImage !== "") {
      obj.profileImage = message.profileImage;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UserInfoResponse>, I>>(base?: I): UserInfoResponse {
    return UserInfoResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UserInfoResponse>, I>>(object: I): UserInfoResponse {
    const message = createBaseUserInfoResponse();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.plan = object.plan ?? "";
    message.profileImage = object.profileImage ?? "";
    return message;
  },
};

export type UserService = typeof UserService;
export const UserService = {
  getUserInfoById: {
    path: "/auth.User/getUserInfoById",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UserInfoRequest): Buffer => Buffer.from(UserInfoRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer): UserInfoRequest => UserInfoRequest.decode(value),
    responseSerialize: (value: UserInfoResponse): Buffer => Buffer.from(UserInfoResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer): UserInfoResponse => UserInfoResponse.decode(value),
  },
} as const;

export interface UserServer extends UntypedServiceImplementation {
  getUserInfoById: handleUnaryCall<UserInfoRequest, UserInfoResponse>;
}

export interface UserClient extends Client {
  getUserInfoById(
    request: UserInfoRequest,
    callback: (error: ServiceError | null, response: UserInfoResponse) => void,
  ): ClientUnaryCall;
  getUserInfoById(
    request: UserInfoRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UserInfoResponse) => void,
  ): ClientUnaryCall;
  getUserInfoById(
    request: UserInfoRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UserInfoResponse) => void,
  ): ClientUnaryCall;
}

export const UserClient = makeGenericClientConstructor(UserService, "auth.User") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): UserClient;
  service: typeof UserService;
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

function toTimestamp(date: Date): Timestamp {
  const seconds = Math.trunc(date.getTime() / 1_000);
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

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
