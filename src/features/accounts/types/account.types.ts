export type Account = {
  id?: string;
  user_id: string;
  name: string;
  default: boolean;
};

export type AccountDoc = Account & { id: string };

export type CreateAccountInput = Pick<Account, "name">;
