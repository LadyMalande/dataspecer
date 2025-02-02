"use client";
import React, { useState } from "react";

import { classA, classB, classC, type CimClass } from "./class";

const CimClassJsx: React.FC<{ thisCls: number; classes: CimClass[]; changeClasses: changeClassesSetter }> = ({
    thisCls,
    classes,
    changeClasses,
}) => {
    const cls = classes.at(thisCls);
    if (!cls) return <div className="border border-red-500">Class with number: {thisCls} not found</div>;
    const originalClasses = classes;

    const handleMouseEnter = (what: string) => {
        originalClasses.find((c) => c.name === what)?.setHighlited(true);
        changeClasses([...originalClasses]);
    };

    const handleMouseLeave = (what: string) => {
        originalClasses.find((c) => c.name === what)?.setHighlited(false);
        changeClasses([...originalClasses]);
    };

    const highlitedStyle = "m-20 border-2 border-slate-500 bg-slate-50 text-slate-700";
    const normalStyle = "m-20 border-2 border-black bg-slate-200 text-black";

    return (
        <>
            <div className={cls.highlighted ? highlitedStyle : normalStyle} key={cls.name}>
                <h4>{cls.name}</h4>
                <h6>Attributes</h6>
                {cls.attributes.map((attr) => (
                    <div key={attr.name + attr.value}>
                        name: {attr.name}, value: {attr.value}
                    </div>
                ))}
                <h6>Associations</h6>
                {cls.associations.map((assoc) => (
                    <div
                        key={assoc.name}
                        onMouseEnter={() => handleMouseEnter(assoc.assocEnd.name)}
                        onMouseLeave={() => handleMouseLeave(assoc.assocEnd.name)}
                    >
                        Name: {assoc.name}, AssocEnd: {assoc.assocEnd.name}
                    </div>
                ))}
            </div>
        </>
    );
};

type changeClassesSetter = React.Dispatch<React.SetStateAction<CimClass[]>>;

const Page = () => {
    const [classes, setClasses] = useState([classA, classB, classC]);
    return (
        <>
            <h1>Classes with highlited assiciations</h1>
            <div className="container">
                {classes.map((_, i) => (
                    <CimClassJsx thisCls={i} classes={classes} changeClasses={setClasses} key={i} />
                ))}
            </div>
        </>
    );
};

export default Page;
