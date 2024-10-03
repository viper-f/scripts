/**
 * simpleValidateHtmlStr
 *
 * checks html string tag by tag if valid, trys html string to render as dom, compares theoretically to be created tag count with
 * actually rendered html dom tag count
 * returns true if validated html is same as entered html
 * returns false if one of the tests failes
 * returns normalized html str if validated html is not equal to entered html
 *
 * kudos
 *	- http://www.mkyong.com/regular-expressions/how-to-validate-html-tag-with-regular-expression/
 *	- https://stackoverflow.com/questions/10026626/check-if-html-snippet-is-valid-with-javascript#14216406
 *
 * @param	htmlStr	string with html snippet
 * @param	strictBoolean if true, <br/> >> <br> and empty attribute conversion are not ignored
 * @retuns {string|boolean}
 */

function simpleValidateHtmlStr(htmlStr, strictBoolean = false) {
    if (typeof htmlStr !== "string")
        return false;

    var validateHtmlTag = new RegExp("<[a-z]+(\s+|\"[^\"]*\"\s?|'[^']*'\s?|[^'\">])*>", "igm"),
        sdom = document.createElement('div'),
        noSrcNoAmpHtmlStr = htmlStr
            .replace(/ src=/igm, " svhs___src=")
            .replace(/&amp;/igm, "#svhs#amp##"),
        noSrcNoAmpIgnoreScriptContentHtmlStr = noSrcNoAmpHtmlStr
            .replace(/\n\r?/igm, "#svhs#nl##") // temporarily remove line breaks
            .replace(/(<script[^>]*>)(.*?)(<\/script>)/igm, "$1$3")
            .replace(/#svhs#nl##/igm, "\n\r"),  // re-add line breaks
        htmlTags = noSrcNoAmpIgnoreScriptContentHtmlStr.match(/<[a-z]+[^>]*>/igm),
        htmlTagsCount = htmlTags ? htmlTags.length : 0,
        tagsAreValid, resHtmlStr;

    console.log(noSrcNoAmpHtmlStr, noSrcNoAmpIgnoreScriptContentHtmlStr, htmlTags);

    if(!strictBoolean){
        // ignore <br/> conversions
        noSrcNoAmpHtmlStr = noSrcNoAmpHtmlStr.replace(/<br\s*\/>/, "<br>")
    }

    if (htmlTagsCount) {
        tagsAreValid = htmlTags.reduce(function(isValid, tagStr) {
            return isValid && tagStr.match(validateHtmlTag);
        }, true);

        if (!tagsAreValid) {
            return false;
        }
    }


    try {
        sdom.innerHTML = noSrcNoAmpHtmlStr;
    } catch (err) {
        return false;
    }

    if (sdom.querySelectorAll("*").length !== htmlTagsCount) {
        return false;
    }

    resHtmlStr = sdom.innerHTML.replace(/&amp;/igm, "&"); // undo '&' encoding

    if(!strictBoolean){
        // ignore empty attribute normalizations
        resHtmlStr = resHtmlStr.replace(/=""/, "")
    }

    // compare html strings while ignoring case, quote-changes, trailing spaces
    var
        simpleIn = noSrcNoAmpHtmlStr.replace(/["']/igm, "").replace(/\s+/igm, " ").toLowerCase().trim(),
        simpleOut = resHtmlStr.replace(/["']/igm, "").replace(/\s+/igm, " ").toLowerCase().trim();
    if (simpleIn === simpleOut)
        return true;

    resHtmlStr = resHtmlStr.replace(/ svhs___src=/igm, " src=").replace(/#svhs#amp##/, "&amp;");
    return resHtmlStr.replace(/<\b([a-z]+(s+|"[^"]*"s?|'[^']*'s?|[^'">])*)><\/\1>/gm, '')

}
