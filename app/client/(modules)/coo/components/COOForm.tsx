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
          {/* Certificate Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Certificate Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Certificate Type ID
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
                <label className="text-sm text-gray-600">Status</label>
                <input
                  type="text"
                  value={certificateData.message_info.status}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Approval Date</label>
                <input
                  type="text"
                  value={new Date(
                    certificateData.message_info.approval_date_and_time
                  ).toLocaleString()}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Exporter Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Exporter Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Exporter TIN</label>
                <input
                  type="text"
                  value={certificateData.message_info.exporter_tin}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Exporter Name</label>
                <input
                  type="text"
                  value={certificateData.message_info.exporter_name}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Exporter Address
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.exporter_address}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Exporter Email</label>
                <input
                  type="email"
                  value={certificateData.message_info.exporter_email_address}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Exporter Telephone
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.exporter_telephone_number}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Consignee Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Consignee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Consignee TIN</label>
                <input
                  type="text"
                  value={certificateData.message_info.consignee_tin}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Consignee Name</label>
                <input
                  type="text"
                  value={certificateData.message_info.consignee_name}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Consignee Address
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.consignee_address}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Applicant Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Applicant Name</label>
                <input
                  type="text"
                  value={certificateData.message_info.applicant_name}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Applicant Address
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.applicant_address}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Application Place
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.application_place_name}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Transport Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Transport Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Transport Particulars
                </label>
                <input
                  type="text"
                  value={
                    certificateData.message_info.transport_particulars_contents
                  }
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Transport Content
                </label>
                <input
                  type="text"
                  value={
                    certificateData.message_info.transport_particulars_content
                  }
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Country Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Country Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Issue Country Code
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.issue_country_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Destination Country Code
                </label>
                <input
                  type="text"
                  value={certificateData.message_info.destination_country_code}
                  disabled
                  className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Item Information */}
          <div className="flex flex-col gap-4 border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-[15px] font-semibold text-gray-700">
              Item Information
            </h3>
            {certificateData.message_info.item_info.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Mark Description
                    </label>
                    <input
                      type="text"
                      value={item.mark_description}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Item Number</label>
                    <input
                      type="text"
                      value={item.item_number}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">HS8 Code</label>
                    <input
                      type="text"
                      value={item.hs8_code}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Product Description
                    </label>
                    <input
                      type="text"
                      value={item.product_description}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Package Number
                    </label>
                    <input
                      type="text"
                      value={item.package_number}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Package Unit Code
                    </label>
                    <input
                      type="text"
                      value={item.package_unit_code}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Commercial Description
                    </label>
                    <input
                      type="text"
                      value={item.commercial_description}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Gross Weight
                    </label>
                    <input
                      type="text"
                      value={`${item.gross_weight} ${item.gross_weight_unit_code}`}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Origin Criteria ID
                    </label>
                    <input
                      type="text"
                      value={item.origin_criteria_id}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={item.invoice_number}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Invoice Date
                    </label>
                    <input
                      type="text"
                      value={new Date(item.invoice_date).toLocaleDateString()}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Item Value</label>
                    <input
                      type="text"
                      value={`${item.item_value} ${item.currency_code}`}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Supplementary Quantity
                    </label>
                    <input
                      type="text"
                      value={`${item.supplementary_quantity} ${item.supplementary_quantity_unit_code}`}
                      disabled
                      className="w-full px-4 py-2.5 border border-zinc-200 bg-gray-50 rounded-[8px] text-gray-600"
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
