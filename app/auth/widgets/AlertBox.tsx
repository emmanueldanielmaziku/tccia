export default function AlertBox() { 
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-6 max-w-sm w-full"> 
                <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
                    Success!
                </h2>
                <p className="text-gray-700 text-center mb-4">
                    Your action was successful. Thank you for your submission!
                </p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Go Back
                </button>
            </div>
        </div>
    );  
}