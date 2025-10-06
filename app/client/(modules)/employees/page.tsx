"use client";
import { useState } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../employees/components/StatsBar";
import { Add, CloseCircle, MoreCircle, SearchNormal1 } from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";
import AddOfficerForm from "./components/AddOfficerForm";
import { useRightSidebar } from "../../../contexts/RightSidebarContext";

// Sample employees data
const employeesData = [
  {
    sn: 1,
    fullName: "John Doe",
    role: "Manager",
    companies: ["Acme Corp", "Globex Inc", "Acme Corp", "Globex Inc"],
    status: "On-duty",
  },
  {
    sn: 2,
    fullName: "Jane Smith",
    role: "Supervisor",
    companies: ["Umbrella Ltd"],
    status: "Off-duty",
  },
  {
    sn: 3,
    fullName: "Michael Johnson",
    role: "Operator",
    companies: ["Acme Corp", "Wayne Enterprises"],
    status: "On-duty",
  },
  {
    sn: 4,
    fullName: "Emily Brown",
    role: "Technician",
    companies: ["Globex Inc"],
    status: "On-duty",
  },
  {
    sn: 5,
    fullName: "David Wilson",
    role: "Clerk",
    companies: ["Wayne Enterprises", "Umbrella Ltd"],
    status: "Off-duty",
  },
  {
    sn: 6,
    fullName: "Sarah Lee",
    role: "HR",
    companies: ["Acme Corp"],
    status: "On-duty",
  },
  {
    sn: 7,
    fullName: "Chris Evans",
    role: "Security",
    companies: ["Globex Inc"],
    status: "On-duty",
  },
  {
    sn: 8,
    fullName: "Anna White",
    role: "Accountant",
    companies: ["Umbrella Ltd"],
    status: "Off-duty",
  },
  {
    sn: 9,
    fullName: "Tom Clark",
    role: "Supervisor",
    companies: ["Wayne Enterprises"],
    status: "On-duty",
  },
  {
    sn: 10,
    fullName: "Lisa Turner",
    role: "Manager",
    companies: ["Acme Corp", "Globex Inc"],
    status: "On-duty",
  },
  {
    sn: 11,
    fullName: "Peter Parker",
    role: "Technician",
    companies: ["Wayne Enterprises"],
    status: "Off-duty",
  },
  {
    sn: 12,
    fullName: "Mary Jane",
    role: "Operator",
    companies: ["Umbrella Ltd"],
    status: "On-duty",
  },
  {
    sn: 13,
    fullName: "Bruce Wayne",
    role: "CEO",
    companies: ["Wayne Enterprises"],
    status: "On-duty",
  },
  {
    sn: 14,
    fullName: "Clark Kent",
    role: "Manager",
    companies: ["Globex Inc"],
    status: "Off-duty",
  },
  {
    sn: 15,
    fullName: "Diana Prince",
    role: "HR",
    companies: ["Acme Corp"],
    status: "On-duty",
  },
  {
    sn: 16,
    fullName: "Barry Allen",
    role: "Operator",
    companies: ["Umbrella Ltd"],
    status: "On-duty",
  },
  {
    sn: 17,
    fullName: "Hal Jordan",
    role: "Security",
    companies: ["Globex Inc"],
    status: "Off-duty",
  },
  {
    sn: 18,
    fullName: "Arthur Curry",
    role: "Technician",
    companies: ["Wayne Enterprises"],
    status: "On-duty",
  },
  {
    sn: 19,
    fullName: "Victor Stone",
    role: "Clerk",
    companies: ["Acme Corp"],
    status: "On-duty",
  },
  {
    sn: 20,
    fullName: "Selina Kyle",
    role: "Accountant",
    companies: ["Globex Inc", "Wayne Enterprises"],
    status: "Off-duty",
  },
  {
    sn: 21,
    fullName: "Steve Rogers",
    role: "Supervisor",
    companies: ["Umbrella Ltd"],
    status: "On-duty",
  },
  {
    sn: 22,
    fullName: "Natasha Romanoff",
    role: "Manager",
    companies: ["Acme Corp"],
    status: "On-duty",
  },
  {
    sn: 23,
    fullName: "Tony Stark",
    role: "CEO",
    companies: ["Globex Inc"],
    status: "On-duty",
  },
  {
    sn: 24,
    fullName: "Wanda Maximoff",
    role: "HR",
    companies: ["Umbrella Ltd"],
    status: "Off-duty",
  },
  {
    sn: 25,
    fullName: "Sam Wilson",
    role: "Security",
    companies: ["Wayne Enterprises"],
    status: "On-duty",
  },
  {
    sn: 26,
    fullName: "Bucky Barnes",
    role: "Technician",
    companies: ["Acme Corp"],
    status: "Off-duty",
  },
  {
    sn: 27,
    fullName: "Scott Lang",
    role: "Clerk",
    companies: ["Globex Inc"],
    status: "On-duty",
  },
  {
    sn: 28,
    fullName: "Hope Van Dyne",
    role: "Accountant",
    companies: ["Umbrella Ltd"],
    status: "On-duty",
  },
  {
    sn: 29,
    fullName: "T'Challa",
    role: "Manager",
    companies: ["Wayne Enterprises"],
    status: "On-duty",
  },
  {
    sn: 30,
    fullName: "Shuri",
    role: "Technician",
    companies: ["Acme Corp", "Globex Inc"],
    status: "Off-duty",
  },
];

export default function EmployeesManagement() {
  const { isRightSidebarOpen } = useRightSidebar();
  const [addEmployeeForm, setAddEmployeeForm] = useState(false);
    const [discardBoxState, setDiscardBoxState] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const totalPages = Math.ceil(employeesData.length / itemsPerPage);
    const paginatedData = employeesData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
            {discardBoxState && (
                <AlertBox
                    onConfirm={() => {
                        setDiscardBoxState(false), setAddEmployeeForm(false);
                    }}
                    onCancel={() => setDiscardBoxState(false)}
                />
            )}
            <NavBar title={"Employees Management"} />

            {/* Content */}
            <section className="flex flex-row">
                <div className="flex flex-col items-center flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
                    <div className="flex flex-col justify-between items-center mt-2 w-full h-[86vh] rounded-sm relative px-16.5">
                        {/* Header */}
                        <div className="flex flex-row w-full justify-between items-center my-1">
                            {addEmployeeForm ? (
                                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                                    Add Employee
                                </div>
                            ) : (
                                <label className="flex justify-center items-center">
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        className="border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-sm pl-8 pr-2.5 py-2.5 text-sm placeholder:text-sm"
                                    />
                                    <SearchNormal1
                                        size="18"
                                        color="gray"
                                        className="absolute left-19"
                                    />
                                </label>
                            )}

                            {/* button */}
                            {addEmployeeForm ? (
                                <button
                                    className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2.5"
                                    onClick={() => {
                                        setDiscardBoxState(true);
                                    }}
                                >
                                    <CloseCircle size={20} color="red" />
                                    Close
                                </button>
                            ) : (
                                <button
                                    className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2.5"
                                    onClick={() => setAddEmployeeForm(true)}
                                >
                                    <Add size={20} color="white" />
                                    Add Employee
                                </button>
                            )}
                        </div>
                        {/* Main */}
                        {addEmployeeForm ? (
                            <div className="w-full flex items-center justify-center h-full">
                                <AddOfficerForm />
                            </div>
                        ) : (
                            <div className="w-full mt-5 rounded-md border-[0.5px] overflow-hidden overflow-y-auto h-[100%]">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-4 py-5 text-left text-gray-700"></th>
                                            <th className="px-4 py-5 text-left text-gray-700">S/N</th>
                                            <th className="px-4 py-5 text-left text-gray-700">Full Name</th>
                                            <th className="px-4 py-5 text-left text-gray-700">Role</th>
                                            <th className="px-4 py-5 text-left text-gray-700">Companies</th>
                                            <th className="px-4 py-5 text-left text-gray-700">Status</th>
                                            <th className="px-4 py-5 text-left text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((employee, index) => (
                                            <tr
                                                key={employee.sn}
                                                className={`hover:bg-gray-100 transition-colors border-t-[0.5px] rounded-[12px] text-gray-700 border-zinc-200 ${
                                                    index % 2 === 0 ? "bg-white" : "bg-gray-white"
                                                }`}
                                            >
                                                <td className="px-4 py-4"></td>
                                                <td className="px-4 py-4">{employee.sn}</td>
                                                <td className="px-4 py-4">{employee.fullName}</td>
                                                <td className="px-4 py-4">{employee.role}</td>
                                                <td className="px-4 py-4">
                                                    {employee.companies.map((c, i) => (
                                                        <span
                                                            key={c}
                                                            className="inline-block bg-blue-50 text-blue-600 rounded px-2 py-0.5 mr-1 text-xs border border-blue-100"
                                                        >
                                                            {c}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] ${
                                                            employee.status === "On-duty"
                                                                ? "bg-green-50 text-green-500 border-green-300"
                                                                : "bg-orange-50 text-orange-400 border-orange-200"
                                                        }`}
                                                    >
                                                        {employee.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button className="w-full flex items-center justify-center cursor-pointer">
                                                        <MoreCircle color="gray" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {addEmployeeForm ? null : (
                            <div className="flex justify-between items-center mt-4 bg-white/35 backdrop-blur-md w-full">
                                <span className="text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <div className="flex flex-row justify-between items-center gap-8">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-6 py-1.5 text-sm rounded ${
                                            currentPage === 1
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-6 py-1.5 text-sm rounded ${
                                            currentPage === totalPages
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {isRightSidebarOpen && <ProgressTracker />}
               
            </section>
            {/* End of Content */}
        </main>
    );
}
