import React from 'react';

type RecordDetailProps = {
    recordId: string;
};

const RecordDetail: React.FC = ({recordId} : RecordDetailProps) => {
    const [record, setRecord] = React.useState<RecordData | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    const loadRecord = async () => {
        try {
            setLoading(true);
            const fetchedRecord = await window.electronAPI.getRecord(recordId);
            if (fetchedRecord) {
                setRecord(fetchedRecord);
            } else {
                setError("Record not found");
            }
        } catch (err) {
            setError("Failed to load record");
        } finally {
            setLoading(false);
        }
    }

}

export default RecordDetail;