// app/admin/activities/recap-invoices/page.tsx
"use client"
// import * as React from "react"
import { useState } from "react"

// import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxTrigger,
    ComboboxList,
    ComboboxValue,
} from "@/components/ui/combobox"
import { 
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/layout/data-table"
import { SectionCards } from "@/components/layout/section-cards"

import data from "../../data.json"

type Country = {
    value: string
    label: string
}
const countries: Country[] = []

export default function RecapInvoices() {
    const [query, setQuery] = useState("")

    const filteredCountries = countries.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
    )
    return (
        <>
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h2 className="text-2xl font-bold tracking-tight">Recap Invoices</h2>
                <p className="text-muted-foreground">
                    This page provides a summary of all invoices, including total amounts,
                    due dates, and payment statuses.
                </p>
                <Card size="sm" className="mx-auto w-full">
                    <form className="w-full">
                        <CardContent>
                            <div className="flex gap-3 pb-3">
                                <Field>
                                    <FieldLabel htmlFor="input-field-noaccounting">No Accounting</FieldLabel>
                                    <Input
                                        id="input-field-noaccounting"
                                        type="number"
                                        required
                                        placeholder="5100xxxx"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-field-nofr">No FR</FieldLabel>
                                    <Input
                                        id="input-field-nofr"
                                        type="text"
                                        required
                                        placeholder="072/FRF/xxxx"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-field-nofr">COA</FieldLabel>
                                    <Input
                                        id="input-field-nofr"
                                        type="text"
                                        required
                                        placeholder="51xxx"
                                    />
                                </Field>
                            </div>
                            <div className="flex gap-3 pb-3">
                                <Field>
                                    <FieldLabel htmlFor="input-field-seller">Seller</FieldLabel>
                                    <Combobox id="input-field-seller" items={countries} defaultValue={countries[0]}>
                                        <ComboboxTrigger render={<Button variant="outline" className="w-64 justify-between font-normal"><ComboboxValue /></Button>} />
                                        <ComboboxContent>
                                            <ComboboxInput showTrigger={false} placeholder="Search" onChange={(e) => setQuery(e.target.value)}/>
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {filteredCountries.map((framework) => (
                                                <ComboboxItem
                                                    key={framework.value}
                                                    value={framework.value}
                                                >
                                                    {framework.label}
                                                </ComboboxItem>
                                                ))}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-field-dpp">DPP Bruto</FieldLabel>
                                    <Input
                                        id="input-field-dpp"
                                        type="number"
                                        required
                                        placeholder="51xxx"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-field-invdate">Tanggal Invoice</FieldLabel>
                                    <Input
                                        id="input-field-invdate"
                                        type="date"
                                        required
                                        placeholder=""
                                    />
                                </Field>
                            </div>
                            <div className="flex gap-3 pb-3">
                                <Field>
                                    <FieldLabel htmlFor="input-field-seller">Status</FieldLabel>
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                            <SelectItem value="rekap">Rekap</SelectItem>
                                            <SelectItem value="credited">Credited</SelectItem>
                                            <SelectItem value="uncredited">Uncredited</SelectItem>
                                            <SelectItem value="e-faktur">e-Faktur</SelectItem>
                                            <SelectItem value="-">-</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-field-pajak">Pajak</FieldLabel>
                                    <Combobox id="input-field-pajak" multiple items={countries}>
                                        <ComboboxTrigger render={<Button variant="outline" className="w-64 justify-between font-normal"><ComboboxValue /></Button>} />
                                        <ComboboxContent>
                                            <ComboboxInput showTrigger={false} placeholder="Search" onChange={(e) => setQuery(e.target.value)}/>
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {filteredCountries.map((framework) => (
                                                <ComboboxItem
                                                    key={framework.value}
                                                    value={framework.value}
                                                >
                                                    {framework.label}
                                                </ComboboxItem>
                                                ))}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-field-keterangan">Keterangan</FieldLabel>
                                    <Input
                                        id="input-field-keterangan"
                                        type="text"
                                        required
                                        placeholder="Jasa Konsultasi"
                                    />
                                </Field>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" variant="outline" size="sm" className="w-full">
                                Action
                            </Button>
                            <Button type="submit" variant="outline" size="sm" className="w-full">
                                Action
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <DataTable data={data} />
        </>
    )
}