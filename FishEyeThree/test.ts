 parseLabel(rowLabel: string, editedLabel: string){
        const newParentLabel = rowLabel.split('.').slice(0, -1).join('.')
        const editedParentLabel = editedLabel.split('.').slice(0, -1).join('.')
        const shortNewLabel = rowLabel.split('.').pop()
        const isDuplicate = some(this.labelList(), l => rowLabel === l);
        const isError = !editedLabel || isDuplicate || !shortNewLabel || newParentLabel !== editedParentLabel
        return {newParentLabel, editedParentLabel, shortNewLabel, isDuplicate, isError}
    }