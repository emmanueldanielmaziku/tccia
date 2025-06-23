"use client";
import { useState } from "react";

interface COOFormProps {
  certificateData?: any;
}

export default function COOForm({ certificateData }: COOFormProps) {
  if (!certificateData) {
    return null;
  }

 
  const {
    message_info,
    transport = [],
    invoice = [],
    item = [],
    attachment = [],
  } = certificateData;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <form
        className="flex flex-col w-full h-full overflow-hidden"
        autoComplete="off"
      >
        <div className="flex flex-col gap-6 overflow-y-auto h-full px-4">
        
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
                  value={message_info.application_uuid}
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
                  value={message_info.organization_code}
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
                  value={message_info.certificate_type_id}
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
                  value={message_info.application_degree}
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
                  value={message_info.application_type_code}
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
                  value={message_info.application_classification_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">State Code</label>
                <input
                  type="text"
                  value={message_info.application_state_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Control Number</label>
                <input
                  type="text"
                  value={message_info.control_number}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Certificate Cost
                </label>
                <input
                  type="text"
                  value={message_info.certificate_cost}
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
                  value={message_info.interface_id}
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
                  value={message_info.send_date_and_time}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Sender ID</label>
                <input
                  type="text"
                  value={message_info.sender_id}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Receiver ID</label>
                <input
                  type="text"
                  value={message_info.receiver_id}
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
                  value={message_info.reference_number}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">UCR Number</label>
                <input
                  type="text"
                  value={message_info.ucr_number}
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
                  value={message_info.party_uuid}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party Name</label>
                <input
                  type="text"
                  value={message_info.party_name}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party Type</label>
                <input
                  type="text"
                  value={message_info.party_type_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party TIN</label>
                <input
                  type="text"
                  value={message_info.party_tin}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Country Code</label>
                <input
                  type="text"
                  value={message_info.party_country_code}
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
                  value={message_info.party_physical_address}
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
                  value={message_info.party_contact_officer_name}
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
                  value={message_info.party_contact_officer_telephone_number}
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
                  value={message_info.party_contact_officer_email}
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
            {/* Transport Information */}
            {(() => {
              const t = transport[0] || {};
              return (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[14px] font-medium text-gray-600">
                    Transport Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={t.transport_mode_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Transport Mode Code"
                    />
                    <input
                      type="text"
                      value={t.transport_means_name || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Transport Means Name"
                    />
                    <input
                      type="text"
                      value={t.transport_means_number || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Transport Means Number"
                    />
                    <input
                      type="text"
                      value={t.transport_company_name || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Transport Company Name"
                    />
                    <input
                      type="text"
                      value={t.departure_expected_date || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Departure Expected Date"
                    />
                    <input
                      type="text"
                      value={t.arrival_expected_date || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Arrival Expected Date"
                    />
                    <input
                      type="text"
                      value={t.departure_port_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Departure Port Code"
                    />
                    <input
                      type="text"
                      value={t.arrival_port_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Arrival Port Code"
                    />
                    <input
                      type="text"
                      value={t.container_number || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Container Number"
                    />
                    <input
                      type="text"
                      value={t.container_size_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Container Size Code"
                    />
                    <input
                      type="text"
                      value={t.container_count || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Container Count"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Invoice Information */}
            {(() => {
              const inv = invoice[0] || {};
              return (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[14px] font-medium text-gray-600">
                    Invoice Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={inv.invoice_uuid || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Invoice UUID"
                    />
                    <input
                      type="text"
                      value={inv.delivery_terms_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Delivery Terms Code"
                    />
                    <input
                      type="text"
                      value={inv.invoice_currency_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Invoice Currency Code"
                    />
                    <input
                      type="text"
                      value={inv.invoice_exchange_rate || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Invoice Exchange Rate"
                    />
                    <input
                      type="text"
                      value={inv.customs_value || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Customs Value"
                    />
                    <input
                      type="text"
                      value={inv.customs_usd_value || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Customs USD Value"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Item Information */}
            {(() => {
              const itm = item[0] || {};
              return (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[14px] font-medium text-gray-600">
                    Item Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={itm.item_uuid || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Item UUID"
                    />
                    <input
                      type="text"
                      value={itm.item_number || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Item Number"
                    />
                    <input
                      type="text"
                      value={itm.hs_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="HS Code"
                    />
                    <input
                      type="text"
                      value={itm.item_description || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Item Description"
                    />
                    <input
                      type="text"
                      value={itm.item_quantity || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Item Quantity"
                    />
                    <input
                      type="text"
                      value={itm.item_quantity_unit_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Item Quantity Unit Code"
                    />
                    <input
                      type="text"
                      value={itm.origin_country_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Origin Country Code"
                    />
                    <input
                      type="text"
                      value={itm.item_value || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Item Value"
                    />
                    <input
                      type="text"
                      value={itm.currency_code || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Currency Code"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Attachments Information */}
            {(() => {
              const att = attachment[0] || {};
              return (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[14px] font-medium text-gray-600">
                    Attachment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={att.document_type || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Document Type"
                    />
                    <input
                      type="text"
                      value={att.document_name || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Document Name"
                    />
                    <input
                      type="text"
                      value={att.file_size || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="File Size"
                    />
                    <input
                      type="text"
                      value={att.upload_date || ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                      placeholder="Upload Date"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </form>
    </div>
  );
}
