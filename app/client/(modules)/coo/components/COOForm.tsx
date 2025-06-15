"use client";
import { useState } from "react";

interface COOFormProps {
  certificateData?: any;
}

export default function COOForm({ certificateData }: COOFormProps) {
  if (!certificateData) {
    return null;
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <form
        className="flex flex-col w-full h-full overflow-hidden"
        autoComplete="off"
      >
        <div className="flex flex-col gap-6 overflow-y-auto h-full px-4">
          {/* Application Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Application Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application UUID
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.application_uuid}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Organization Code
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.organization_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Number
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.certificate_type_id}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Degree
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.application_degree}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Type
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.application_type_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Classification Code
                </label>
                <input
                  type="text"
                  value={
                    certificateData.message_info.application_classification_code
                  }
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">State Code</label>
                <input
                  type="text"
                  value={certificateData.message_info.application_state_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Header Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Header Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Interface ID</label>
                <input
                  type="text"
                  value={certificateData.message_info.interface_id}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Send Date and Time
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.send_date_and_time}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Sender ID</label>
                <input
                  type="text"
                  value={certificateData.message_info.sender_id}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Receiver ID</label>
                <input
                  type="text"
                  value={certificateData.message_info.receiver_id}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.reference_number}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">UCR Number</label>
                <input
                  type="text"
                  value={certificateData.message_info.ucr_number}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Party Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Party Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party UUID</label>
                <input
                  type="text"
                  value={certificateData.message_info.party_uuid}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party Name</label>
                <input
                  type="text"
                  value={certificateData.message_info.party_name}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party Type</label>
                <input
                  type="text"
                  value={certificateData.message_info.party_type_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party TIN</label>
                <input
                  type="text"
                  value={certificateData.message_info.party_tin}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Country Code</label>
                <input
                  type="text"
                  value={certificateData.message_info.party_country_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.party_physical_address}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Contact Officer Name
                </label>
                <input
                  type="text"
                  value={
                    certificateData.message_info.party_contact_officer_name
                  }
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Contact Officer Phone
                </label>
                <input
                  type="text"
                  value={
                    certificateData.message_info
                      .party_contact_officer_telephone_number
                  }
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Contact Officer Email
                </label>
                <input
                  type="text"
                  value={
                    certificateData.message_info.party_contact_officer_email
                  }
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Transport</label>
                <textarea
                  value={JSON.stringify(
                    certificateData.message_info.transport,
                    null,
                    2
                  )}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600 h-24"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Invoice</label>
                <textarea
                  value={JSON.stringify(
                    certificateData.message_info.invoice,
                    null,
                    2
                  )}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600 h-24"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Items</label>
                <textarea
                  value={JSON.stringify(
                    certificateData.message_info.item_info,
                    null,
                    2
                  )}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600 h-24"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Attachments</label>
                <textarea
                  value={JSON.stringify(
                    certificateData.message_info.attachment,
                    null,
                    2
                  )}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600 h-24"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
