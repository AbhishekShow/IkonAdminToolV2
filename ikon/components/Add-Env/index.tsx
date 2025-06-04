'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { create } from 'zustand'

type EnvRow = { server: string; link: string; auth: string }

type EnvState = {
    envs: EnvRow[]
    setEnvs: (rows: EnvRow[]) => void
}

export const useEnvStore = create<EnvState>((set) => ({
    envs: [],
    setEnvs: (rows) => set({ envs: rows }),
}))

export const saveEnvToSessionStorage = (rows: {server: string, link: string, auth: string}[]) => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('envRows', JSON.stringify(rows))
    }
}

export const loadEnvFromSessionStorage = () => {
    
    let rows:{server: string; link: string; auth: string}[] = [];

    if (typeof window !== 'undefined' && window.sessionStorage) {
        const envRows = sessionStorage.getItem('envRows')
        if (envRows) {
            rows = JSON.parse(envRows)
        }
        else {
            rows = [
                {server: 'local', link: '', auth: ''},
                {server: 'dev', link: '', auth: ''},
                {server: 'prod', link: '', auth: ''},
            ]
        }
    }

    return rows;
}

function AddEnv() {
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState([{ server: 'local', link: '', auth: '' }])

    const { envs, setEnvs } = useEnvStore()

    // Load saved envs from global store when dialog is opened
    useEffect(() => {
        if (open) {

            const envs = loadEnvFromSessionStorage();

            if (envs.length > 0) {
                setRows(envs)
            } else {
                setRows([{ server: 'local', link: '', auth: '' }])
            }
        }
    }, [open, envs])

    const handleAddRow = () => {
        setRows([...rows, { server: '', link: '', auth: '' }])
    }

    const handleDeleteRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index))
    }

    const handleChange = (index: number, field: string, value: string) => {
        const updated = [...rows]
        updated[index][field as 'server' | 'link' | 'auth'] = value
        setRows(updated)
    }

    const handleSave = () => {
        setEnvs(rows)
        saveEnvToSessionStorage(rows);
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size={'sm'}>
                    <PlusIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[50vw]">
                <DialogHeader>
                    <DialogTitle>Add Environments</DialogTitle>
                </DialogHeader>

                <div className="border rounded overflow-auto">
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                                <th className="border w-45 p-1">Server</th>
                                <th className="border w-45 p-1">Application Url</th>
                                <th className="border w-45 p-1">Auth Server Url</th>
                                {/* <th className="border w-5 p-1">
                                    <Button variant="outline" size="icon" onClick={handleAddRow}>
                                        <PlusIcon />
                                    </Button>
                                </th> */}
                            </tr>
                        </thead>
                    </table>

                    <div className="max-h-60 overflow-y-auto">
                        <table className="w-full table-fixed border-collapse">
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index}>
                                        <td className="border w-45 p-2">
                                            <Input
                                                value={row.server}
                                                onChange={(e) => handleChange(index, 'server', e.target.value)}
                                                placeholder="Enter server" disabled={true}
                                            />
                                        </td>
                                        <td className="border w-45 p-2">
                                            <Input
                                                value={row.link}
                                                onChange={(e) => handleChange(index, 'link', e.target.value)}
                                                placeholder="Enter Application Url"
                                            />
                                        </td>
                                        <td className="border w-45 p-2">
                                            <Input
                                                value={row.auth}
                                                onChange={(e) => handleChange(index, 'auth', e.target.value)}
                                                placeholder="Enter Auth Server Url"
                                            />
                                        </td>
                                        {/* <td className="border w-5 p-1 text-center">
                                            {index !== 0 && (
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(index)}>
                                                    <TrashIcon className="w-4 h-4 text-red-500" />
                                                </Button>
                                            )}
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddEnv
