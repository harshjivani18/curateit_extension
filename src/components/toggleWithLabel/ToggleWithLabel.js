import { useState } from 'react'
import { Switch } from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ToggleWithLabel({ label }) {
    const [enabled, setEnabled] = useState(false)

    return (
        <Switch.Group as="div" className="flex items-center justify-start">
            <Switch
                checked={enabled}
                onChange={setEnabled}
                className={classNames(
                    enabled ? 'bg-[#347AE2]' : 'bg-gray-200',
                    'ct-relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none'
                )}
            >
                <span
                    aria-hidden="true"
                    className={classNames(
                        enabled ? 'translate-x-3' : 'translate-x-0',
                        'pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                />
            </Switch>
            <Switch.Label as="span" className="ml-2">
                <span className="text-xs font-medium text-gray-400">{label}</span>
            </Switch.Label>
        </Switch.Group>
    )
}
