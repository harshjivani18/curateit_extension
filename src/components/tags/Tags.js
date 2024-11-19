import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag, addTagReset } from '../../actions/tags';
import "./Tags.css"

const KeyCodes = {
    comma: 188,
    enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];


const Tags = ({setSelectedTags, tagsList, userId, selectedTags, dateTag}) => {
    const suggestions       = tagsList ? tagsList.map(tag => ({id: tag.tag, text:tag.tag, tagId: tag.id})) : []
    const [tags, setTags]   = useState(selectedTags ? selectedTags.map(tag => ({id: tag.tag, text:tag.tag, tagId: tag.id})): [])
    const dispatch          = useDispatch()
    const addTags           = useSelector(state => state.tags.addedTagData)

    //Set selected Tag
    useEffect(()=>{
        setTags(selectedTags ? selectedTags.map(tag => ({id: tag.tag, text:tag.tag, tagId: tag.id})): [])
    }, [selectedTags])

    //Set Date tag
    useEffect(()=>{
        if (dateTag) {
            let date = new Date().toLocaleDateString("en-US", {hour:'numeric', minute:'numeric'})
            let suggestionDate = suggestions.filter(t => t.text === date)[0]
            if (suggestionDate) {
                setTags([...tags, suggestionDate])
            }
            else if (!addTags) {
                dispatch(addTag({data:{tag: date, users: userId}}))
            }
        }
    })

    //Set tags
    useEffect(()=>{
        if(tags && tags.length>0){
            setSelectedTags(tags?.map(tag => tag?.tagId ))
        }
    }, [tags])

    //Set new added tag
    useEffect(()=>{
        if(addTags){
            suggestions.push({id: addTags.tag, text:addTags.tag, tagId: addTags.id})
            setTags([...tags, {id: addTags.tag, text:addTags.tag, tagId: addTags.id}])
            dispatch(addTagReset())
        }
    },[addTags])

    
    //delete tag
    const handleDelete = i => {
        setTags(tags.filter((tag, index) => index !== i));
    };

    //add tag
    const handleAddition = tag => {
        let taginsusggestion = suggestions?.filter(su => su.text === tag.text)[0]
        if(taginsusggestion){
            setTags([...tags, taginsusggestion]);
        }else{
            dispatch(addTag({data:{tag: tag.text, users: userId}}))
        }
    };

    return (
        <div className="app">
            <div>
                <ReactTags
                    tags={tags}
                    suggestions={suggestions}
                    delimiters={delimiters}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
                    inputFieldPosition="bottom"
                    placeholder=""
                    autocomplete
                />
            </div>
        </div>
    );
}

export default Tags