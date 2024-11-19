import "./PlainLayout.css"

import React                    from "react";
import PublicHearder            from "../publicHeader/PublicHearder";
import Footer                   from "../footer/Footer";
import { useTheme }             from "../../hooks/useTheme";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const PlainLayout = (props) => {
    const { theme } = useTheme()

    return (
        <>
            <div className={classNames(theme === 'light' && "radial-grad", "plain-container")}>
                <div className={"w-full py-4 dark:bg-[#292B38] h-full overflow-y-auto"}>
                    {props.page && props.page !== "membership" ? <PublicHearder /> : null}
                    <main className='px-8 mt-[14px]'>
                        <div className="border-b border-cyan-100 dark:border-gray-700">
                            {props.children}
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    )
}

export default PlainLayout