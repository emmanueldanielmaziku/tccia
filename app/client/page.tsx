import NavBar from "./components/NavBar";

export default function Dashboard() {
  return (
    <main className="flex items-center justify-center w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <NavBar title={"Dashboard"} />
    </main>
  );
}
