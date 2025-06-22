export interface Director {
  name: string;
  nationality: string;
  contact: string;
}

export interface ContactPerson {
  name: string;
  nationality: string;
  contact: string;
}

export interface CompanyData {
  application_id: number;
  tin: string;
  name: string;
  incorporation_number: string;
  year_establishment: string;
  business_licence_no: string;
  postal_address: string;
  street: string;
  email: string;
  mobile: string;
  fax: string;
  state: string;
  director_line_ids: Director[];
  contact_person_line_ids: ContactPerson[];
}

export interface MembershipResponse {
  jsonrpc: string;
  id: null;
  result: {
    application_id: number;
    data: CompanyData;
    message: string;
  };
}

export interface VerificationResponse {
  jsonrpc: string;
  id: null;
  result: {
    success: boolean;
    message: string;
    data?: {
      membership_id: string;
      status: string;
      expiry_date: string;
    };
    error?: string;
  };
}
