import { Account, Address, BN, bufferToHex, toBuffer } from "ethereumjs-util";

import { Transaction, AccessListEIP2930Transaction } from "@ethereumjs/tx";
import { TxReceipt } from "@ethereumjs/vm/dist/types";

/**
 * interface account {
 *   id: string,        // 32 byte hex string
 *   hash: string,      // 32 byte hex string
 *   timestamp: number, // ms since epoch
 *   data: {
 *     balance: number
 *   }
 * }
 *
 * interface accounts {
 *   [id: string]: account
 * }
 */

export enum AccountType {
  Account, //  EOA or CA
  ContractStorage, // Contract storage key value pair
  ContractCode, // Contract code bytes
  Receipt, //This holds logs for a TX
}

/**
 * Still working out the details here.
 * This has become a variant data type now that can hold an EVM account or a key value pair from CA storage
 * I think that is the shortest path for now to get syncing and repair functionality working
 *
 * Long term I am not certain if we will be able to hold these in memory.  They may have to be a temporary thing
 * that is held in memory for awhile but eventually cleared.  This would mean that we have to be able to pull these
 * from disk again, and that could be a bit tricky.
 */
export interface WrappedEVMAccount {
  accountType: AccountType;

  ethAddress: string; //account address in EVM space.
  hash: string; //account hash

  timestamp: number; //account timestamp.  last time a TX changed it

  // Here is the EVM variant data.  An account:
  account?: Account; //actual EVM account. if this is type Account
  // <or> this:
  key?: string; //EVM CA storage key
  value?: Buffer; //EVM buffer value if this is of type CA_KVP

  //What to store for ContractCode?
  codeHash?: Buffer;
  codeByte?: Buffer;
  contractAddress?: string;

  //What to store for Reciept?  .. doesn't look like runTX really does much with them.  runBlock seem to do more.
  //the returned receipt from runTX is seems downcasted, because it actual has more fields than expected.
  //research question..  does the RPC server have any logs checking endpoints..
  //doesnt seem like it on a quick search.
  //It does have a hardcoded logsBloom so maybe we need to fill this with correct data.
  receipt?: TxReceipt;
  txId?: string;
}

export interface WrappedEthAccounts {
  [id: string]: WrappedEVMAccount;
}

export interface EVMAccountInfo {
  type: AccountType;
  evmAddress: string;
}