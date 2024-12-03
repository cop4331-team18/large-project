import { useEffect, useState } from "react";
import { apiCall } from "../util/constants";
import Select, { ActionMeta, MultiValue } from "react-select";

interface AttributesInputProp {
    setAttributesList: React.Dispatch<React.SetStateAction<string[]>>;
    limit?: number;
    placeholder?: string;
}

interface Option {
    value: string;
    label: string;
}

export const AttributesInput: React.FC<AttributesInputProp> = ({setAttributesList, limit, placeholder}: AttributesInputProp) => {
    const [validOptions, setValidOptions] = useState<Option[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

    const fetchValidAttributes = async() => {
        const response = await apiCall.get(`/attributes`);
        const data: any = response.data;
        const attributes: string[] = data.attributes;
        const options: Option[] = [];
        for (const attribute of attributes) {
            options.push({value: attribute, label: attribute});
        }
        setValidOptions(options);
    };

    useEffect(() => {
        fetchValidAttributes();
    }, []);

    const handleChange = (selected: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
        if (limit && actionMeta.action === 'select-option' && selected.length > limit) {
            return;
        } 
        setSelectedOptions([...selected]);
    }

    useEffect(() => {
        const attributes: string[] = [];
        for (const option of selectedOptions) {
            attributes.push(option.value);
        }
        setAttributesList(attributes);
    }, [selectedOptions]);

    return (
        <div className="attributes-input">
            <Select 
                isMulti
                options={validOptions}
                value={selectedOptions}
                onChange={handleChange}
                placeholder={placeholder || "Search Attributes"}
                className="attributes-select"
                maxMenuHeight={180}
                styles={{
                    multiValue: (base) => ({
                        ...base,
                        fontSize: '14px',
                    }),
                    control: (base) => ({
                        ...base,
                        maxHeight: '80px',
                        overflowY: 'scroll',
                        scrollbarWidth: 'thin',
                    }),
                }}
            />
        </div>
    );
}