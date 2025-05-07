import { User } from "iconsax-reactjs";
import { FieldError } from "react-hook-form";

type FormInputProps = {
    name: string;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
    register: (name: string) => any;
    error?: FieldError;
};

export default function FormInput({
    name,
    placeholder = "",
    type = "text",
    icon = <User size="22" color="gray" />,
    register,
    error,
}: FormInputProps) {
    return (
        <div className="relative w-full">
            <input
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className={`w-full px-6 py-3.5 pr-12 border ${error ? "border-red-500" : "border-zinc-300"
                    } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]`}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4">
                {icon}
            </div>
            {error && (
                <p className="text-red-500 text-[11px] absolute left-0 top-[55px]">
                    {error.message}
                </p>
            )}
        </div>
    );
}
