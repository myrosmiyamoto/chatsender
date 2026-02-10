export interface Recipient {
  /** A列: 学籍番号 */
  studentId: string;
  /** B列: 氏名（任意） */
  name: string;
  /** C列: 個別データ */
  colC: string;
  /** D列: 個別データ */
  colD: string;
  /** E列: 個別データ */
  colE: string;
}

export interface SendRequest {
  recipients: Recipient[];
  messageTemplate: string;
}

export interface SendResultItem {
  studentId: string;
  email: string;
  success: boolean;
  chatId?: string;
  error?: string;
}
