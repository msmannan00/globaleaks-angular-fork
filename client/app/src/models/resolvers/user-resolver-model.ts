export class userResolverModel {
  users: User[];
  user_profiles: UserProfile[];
}

export class User {
  id: string;
  creation_date: string;
  username: string;
  salt: string;
  role: string;
  enabled: boolean;
  last_login: string;
  name: string;
  description: string;
  public_name: string;
  mail_address: string;
  change_email_address: string;
  language: string;
  password_change_needed: boolean;
  password_change_date: string;
  pgp_key_fingerprint: string;
  pgp_key_public: string;
  pgp_key_expiration: string;
  pgp_key_remove: boolean;
  picture: boolean;
  tid: number;
  notification: boolean;
  encryption: boolean;
  escrow: boolean;
  two_factor: boolean;
  forcefully_selected: boolean;
  can_postpone_expiration: boolean;
  can_delete_submission: boolean;
  can_grant_access_to_reports: boolean;
  can_edit_general_settings: boolean;
  clicked_recovery_key: boolean;
  contexts: string[];
  newpassword: boolean;
  can_transfer_access_to_reports: boolean;
  can_reopen_reports: boolean;
  can_mask_information: boolean;
  can_redact_information: boolean;
  profile_id: string;
}

export class UserProfile {
  id: string;
  role: string;
  enabled: boolean;
  name: string;
  language: string;
  password_change_needed: boolean;
  password_change_date: string;
  notification: boolean;
  forcefully_selected: boolean;
  can_postpone_expiration: boolean;
  can_delete_submission: boolean;
  can_grant_access_to_reports: boolean;
  can_edit_general_settings: boolean;
  can_transfer_access_to_reports: boolean;
  can_reopen_reports: boolean;
  can_mask_information: boolean;
  can_redact_information: boolean;
}
