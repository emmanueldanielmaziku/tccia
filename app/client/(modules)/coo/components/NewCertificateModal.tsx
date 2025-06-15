import { CloseCircle } from "iconsax-reactjs";

interface NewCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewCertificateModal({
  isOpen,
  onClose,
}: NewCertificateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-[12px] w-full max-w-[600px] mx-4 shadow-xl">
       
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            New Certificate of Origin Application
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseCircle size={20} color="red" className="cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              To apply for a new Certificate of Origin, please follow these
              steps:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <p className="text-gray-600">
                  Visit the TANSIC website and complete the application form
                  with all required details.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <p className="text-gray-600">
                  After submission, your application will be visible here in
                  TCCIA for tracking and management.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <p className="text-gray-600">
                  Once approved, you can view and download your Certificate of
                  Origin directly from this platform.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-blue-700 text-sm">
              Note: Make sure to have all required documents ready before
              starting the application process.
            </p>
          </div>
        </div>

        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <a
            href="https://tansic.go.tz"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Application
          </a>
        </div>
      </div>
    </div>
  );
}
