import { ReactNode, RefObject, useEffect, useRef, MouseEventHandler } from "react";

export function Modal({isOpen, children} : {isOpen : boolean, children: ReactNode})  {
    const dialogRef : RefObject<HTMLDialogElement> = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const dialog = dialogRef.current;
        if (dialog) {
            dialog.showModal();
            return () => {
                dialog.close();
            }    
        }
    }, [isOpen]);

    
    return (
        <dialog ref={dialogRef} className="backdrop:bg-slate-500/50" >
            <div className="flex h-full items-end justify-center text-center sm:items-center sm:p-0 my-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg">
                    {children}
                </div>
            </div>
        </dialog>
    );
}

export function ModalBody({icon, title, children} : {icon : string, title: string, children: ReactNode}){
    return (
        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 text-red-500 text-2xl">
                {icon}
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-2xl sm:text-xl md:text-base font-semibold leading-6 text-gray-900" id="modal-title">{title}</h3>
                <div className="mt-2">
                    <p className="text-xl sm:text-lg md:text-sm text-gray-500">{children}</p>
                </div>
                </div>
            </div>
        </div>
    );
}

export function ModalFooter({children} : {children: ReactNode}){
    return (
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {children}
        </div>
    );
}

export function LoadingOverlay() {
    return (
        <div aria-label="Loading..." role="status" className="absolute bg-white rounded flex flex-col items-center p-2 right-1/2 bottom-1/2	translate-x-1/2 translate-y-1/2">
            <svg className="animate-spin w-6 h-6 fill-slate-800" viewBox="3 3 18 18">
                <path className="opacity-20" d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z">
                </path>
                <path d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z">
                </path>
            </svg>
            <div className="text-slate-500">Loading last board...</div>
        </div>
    );
}
