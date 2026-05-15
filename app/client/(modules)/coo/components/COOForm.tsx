"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Add, CloseCircle, DocumentDownload, DocumentText } from "iconsax-reactjs";

interface COOFormProps {
  certificateData?: any;
}

function safeValue(val: any) {
  return val === false || val === undefined || val === null ? "" : val;
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

  
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const manufacturers = ["Manufacturer A", "Manufacturer B", "Manufacturer C"];

  interface NewAttachment {
    id: string;
    typeCode: string;
    file: File | null;
  }

  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([
    { id: crypto.randomUUID(), typeCode: "", file: null },
  ]);

  const addAttachmentRow = () => {
    setNewAttachments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), typeCode: "", file: null },
    ]);
  };

  const removeAttachmentRow = (id: string) => {
    setNewAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAttachmentField = (
    id: string,
    field: keyof NewAttachment,
    value: string | File | null
  ) => {
    setNewAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

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
                  value={safeValue(message_info.application_uuid)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Organization Code
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.organization_code)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Number
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.certificate_type_id)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Code Number
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.application_code_number)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Degree
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.application_degree)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Type
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.application_type_code)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              {/* Select Manufacturer Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Select Manufacturer
                </label>
                <Select
                  value={selectedManufacturer}
                  onValueChange={setSelectedManufacturer}
                >
                  <SelectTrigger className="w-full border border-zinc-200 bg-white rounded-[8px] px-4 py-2.5 text-gray-600">
                    <SelectValue placeholder="Select a manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Manufacturers</SelectLabel>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Classification Code
                </label>
                <input
                  type="text"
                  value={safeValue(
                    message_info.application_classification_code
                  )}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">State Code</label>
                <input
                  type="text"
                  value={safeValue(message_info.application_state_code)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Invoice number</label>
                <input
                  type="text"
                  value={safeValue(message_info.control_number)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Certificate Cost
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.certificate_cost)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
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
                  value={safeValue(message_info.interface_id)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Send Date and Time
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.send_date_and_time)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Sender ID</label>
                <input
                  type="text"
                  value={safeValue(message_info.sender_id)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Receiver ID</label>
                <input
                  type="text"
                  value={safeValue(message_info.receiver_id)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.reference_number)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">UCR Number</label>
                <input
                  type="text"
                  value={safeValue(message_info.ucr_number)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
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
                  value={safeValue(message_info.party_uuid)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party Name</label>
                <input
                  type="text"
                  value={safeValue(message_info.party_name)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party Type</label>
                <input
                  type="text"
                  value={safeValue(message_info.party_type_code)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Party TIN</label>
                <input
                  type="text"
                  value={safeValue(message_info.party_tin)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Country Code</label>
                <input
                  type="text"
                  value={safeValue(message_info.party_country_code)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.party_physical_address)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Contact Officer Name
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.party_contact_officer_name)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Contact Officer Phone
                </label>
                <input
                  type="text"
                  value={safeValue(
                    message_info.party_contact_officer_telephone_number
                  )}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Contact Officer Email
                </label>
                <input
                  type="text"
                  value={safeValue(message_info.party_contact_officer_email)}
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
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
                      value={safeValue(t.transport_mode_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Transport Mode Code"
                    />
                    <input
                      type="text"
                      value={safeValue(t.transport_means_name)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Transport Means Name"
                    />
                    <input
                      type="text"
                      value={safeValue(t.transport_means_number)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Transport Means Number"
                    />
                    <input
                      type="text"
                      value={safeValue(t.transport_company_name)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Transport Company Name"
                    />
                    <input
                      type="text"
                      value={safeValue(t.departure_expected_date)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Departure Expected Date"
                    />
                    <input
                      type="text"
                      value={safeValue(t.arrival_expected_date)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Arrival Expected Date"
                    />
                    <input
                      type="text"
                      value={safeValue(t.departure_port_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Departure Port Code"
                    />
                    <input
                      type="text"
                      value={safeValue(t.arrival_port_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Arrival Port Code"
                    />
                    <input
                      type="text"
                      value={safeValue(t.container_number)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Container Number"
                    />
                    <input
                      type="text"
                      value={safeValue(t.container_size_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Container Size Code"
                    />
                    <input
                      type="text"
                      value={safeValue(t.container_count)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
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
                      value={safeValue(inv.invoice_uuid)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Invoice UUID"
                    />
                    <input
                      type="text"
                      value={safeValue(inv.delivery_terms_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Delivery Terms Code"
                    />
                    <input
                      type="text"
                      value={safeValue(inv.invoice_currency_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Invoice Currency Code"
                    />
                    <input
                      type="text"
                      value={safeValue(inv.invoice_exchange_rate)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Invoice Exchange Rate"
                    />
                    <input
                      type="text"
                      value={safeValue(inv.customs_value)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Customs Value"
                    />
                    <input
                      type="text"
                      value={safeValue(inv.customs_usd_value)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
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
                      value={safeValue(itm.item_uuid)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Item UUID"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.item_number)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Item Number"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.hs_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="HS Code"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.item_description)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Item Description"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.item_quantity)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Item Quantity"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.item_quantity_unit_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Item Quantity Unit Code"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.origin_country_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Origin Country Code"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.item_value)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Item Value"
                    />
                    <input
                      type="text"
                      value={safeValue(itm.currency_code)}
                    className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                      placeholder="Currency Code"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Attachments Information */}
            {attachment && attachment.length > 0 && (
              <div className="flex flex-col gap-4">
                <h4 className="text-[14px] font-medium text-gray-600 flex items-center gap-2">
                  <DocumentText size={16} color="#4B5563" />
                  Attachments ({attachment.length})
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {attachment.map((att: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-row items-center justify-between p-4 border border-zinc-200 bg-white rounded-[8px] hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-row items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <DocumentText size={20} color="#3B82F6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-gray-700">
                            Attachment #{safeValue(att.attachment_serial_number)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Type Code: {safeValue(att.attachment_type_code)}
                          </div>
                        </div>
                      </div>
                      {att.attachment_link && (
                        <button
                          onClick={() => window.open(att.attachment_link, '_blank')}
                          className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <DocumentDownload size={14} color="white" />
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Attachments */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-medium text-gray-600 flex items-center gap-2">
                <DocumentText size={16} color="#4B5563" />
                Add Attachments
              </h4>

              <div className="flex flex-col gap-3">
                {newAttachments.map((att, index) => (
                  <div
                    key={att.id}
                    className="flex flex-col gap-3 p-4 border border-zinc-200 rounded-[8px] bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Attachment #{index + 1}
                      </span>
                      {newAttachments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttachmentRow(att.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <CloseCircle size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">
                          Attachment Type Code
                        </label>
                        <input
                          type="text"
                          value={att.typeCode}
                          onChange={(e) =>
                            updateAttachmentField(
                              att.id,
                              "typeCode",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 border border-zinc-200 bg-white rounded-[8px] text-gray-900"
                          placeholder="Enter attachment type code"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">
                          Upload Document
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-[8px] p-3 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            onChange={(e) =>
                              updateAttachmentField(
                                att.id,
                                "file",
                                e.target.files?.[0] || null
                              )
                            }
                            className="hidden"
                            id={`file-upload-${att.id}`}
                          />
                          <label
                            htmlFor={`file-upload-${att.id}`}
                            className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            {att.file
                              ? att.file.name
                              : "Click to upload file"}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAttachmentRow}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-blue-300 rounded-[8px] text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <Add size={16} />
                Add Another Attachment
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
