"use client"

import { useState } from "react"


export default function HeaderPage({title, description}: {title: string, description: string}) {

    return (
        <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm">
            {description}
            </p>
        </div>
    )
}
