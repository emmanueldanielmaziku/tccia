import NavBar from "../../components/NavBar";
import FactoryVerificationForm from "./components/FactoryVerificationForm";
import ProgressTracker from "./components/ProgressTracker";

export default function COO() {
    return (
      <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
        <NavBar title={"Certificate of Origin"} />
        {/* Content */}
        <section className="flex flex-row">
          <div className="flex flex-col items-center flex-1 overflow-y-auto h-[97vh] mx-17 mt-24 bg-gray-50 border-zinc-200 border-[1px] rounded-xl">
            <FactoryVerificationForm />
          </div>
          <div className="w-[450px] h-[97vh]">
            <ProgressTracker />
          </div>
        </section>
        {/* End of Content */}
      </main>
    );
}