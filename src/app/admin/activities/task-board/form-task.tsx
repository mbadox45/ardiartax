"use client"

import { useState } from "react"

import {
    Save,
    RefreshCw
} from "lucide-react"

import { Separator } from "@/components/ui/separator"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
    Field,
    FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"


export default function FormTask() {
    const [title, setTitle] = useState("")
    const [kategori, setKategori] = useState("")
    const [deskripsi, setDeskripsi] = useState("")

    const addTask = () => {
        if (!title || !kategori || !deskripsi) return

        // Logic to add task
        console.log("Adding task:", title)
        setTitle("")
        setKategori("")
        setDeskripsi("")
    }

    return (
        <Card size="sm" className="w-full bg-gray-50">
            <CardHeader>
                <CardTitle className="uppercase font-bold text-2xl">Form Task</CardTitle>
                <CardDescription className="text-xs">Tambahkan task baru ke dalam daftar pekerjaanmu.</CardDescription>
            </CardHeader>
            <Separator  />
            <CardContent className="space-y-6">
                <Field>
                    <FieldLabel htmlFor="task-title">Judul Task</FieldLabel>
                    <Input
                        id="task-title"
                        type="text"
                        placeholder="Enter Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Field>
                <Field className="w-1/3">
                    <FieldLabel htmlFor="deskripsi">Kategori</FieldLabel>
                    <RadioGroup defaultValue="comfortable" className="w-fit" value={kategori} onValueChange={setKategori}>
                        <div className="flex gap-8">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="high" id="high" />
                                <Label htmlFor="high">High</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="medium" id="medium" />
                                <Label htmlFor="medium">Medium</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="low" id="low" />
                                <Label htmlFor="low">Low</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </Field>
                <Field>
                    <FieldLabel htmlFor="deskripsi">Deskripsi</FieldLabel>
                    <Textarea id="deskripsi" placeholder="Enter task description" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
                </Field>
                <div className="flex gap-4 justify-end w-full">
                    <Button variant="secondary" className="bg-teal-500 text-white cursor-pointer hover:bg-teal-600" onClick={addTask}>
                        <Save className="size-4" />
                        Submit
                    </Button>
                    <Button variant="secondary" className="bg-amber-500 text-white cursor-pointer hover:bg-amber-600" onClick={addTask}>
                        <RefreshCw className="size-4" />
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
