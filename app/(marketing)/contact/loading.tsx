import { ContactFormSkeleton } from "@/components/sections/marketing-skeletons";

export default function ContactLoading() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="container px-6 mx-auto">
                <ContactFormSkeleton />
            </div>
        </div>
    );
}
