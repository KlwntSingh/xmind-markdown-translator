/**
 * Created by shaoyin.zj on 17/1/8.
 */

const MdSyntax = require('./mdSyntax');
const mdSyntax = new MdSyntax();
const _ = require('lodash');
const xmlLite = require('xml-lite');
const LINE_SEPARATE = '  \r\n';
const LINE_END = '  ';
var plainContent = '';

//xmind to md converter
function xmindToMd(workbook, program){
    var mdContent = [];
    // var sheet = workbook.getPrimarySheet();

    if(program.fileHeader){
        mdContent.push(mdSyntax.txt(program.fileHeader.trimLeft()))
        mdContent.push(mdSyntax.newline())
    }
    _.forEach(workbook.sheets, function (sheet) {
        title = selectBetterName([sheet.getTitle(), sheet.rootTopic.getTitle()])
        mdContent.push(mdSyntax.header(1, title));
        mdContent.push(mdSyntax.newline())
        recursiveToMd(sheet.rootTopic, mdContent, {hierarchy: 1, 'header': 2, 'indent': 0}, program);
        mdContent.push(mdSyntax.newline())
        mdContent.push(mdSyntax.break())
        mdContent.push(mdSyntax.newline())

        return mdContent.join("");
    })
    return mdContent.join("")
}

//递归的
function recursiveToMd(node, mdContent, format, program){
    _.forEach(node.children, function(cnode, num){

        //有可能节点中没有title和超链接，只有图片。把图片作为title来用
        var nodeTitle = trimReturn(cnode.getTitle());//title去掉换行符，否则作为标题会有问题
        var nodeLink = cnode.getHyperlink() ? mdSyntax.link(cnode.getHyperlink(), 'anchor') : '';
        var nodeImg = getNodeImg(cnode);
        if(!(nodeTitle + nodeLink)){
            nodeTitle = nodeImg;
            nodeImg = '';
        }
        newFormat = format
        if(nodeTitle){
            let indent = format.indent
            if(format.hierarchy == 1){
                mdContent.push(mdSyntax.newline())
                if(cnode.children && cnode.children.length>0){
                    mdContent.push(mdSyntax.header(format.header, nodeTitle + ' ' + nodeLink));
                }else{
                    mdContent.push(mdSyntax.header(format.header, nodeTitle + ' ' + nodeLink));
                }
            }else if(format.hierarchy == 2){
                header_format = 4
                if(cnode.children && cnode.children.length>0){
                    indent += 1
                    mdContent.push(mdSyntax.unorderedList(
                        mdSyntax.header(header_format, nodeTitle + ' ' + nodeLink)));
                }else{
                    mdContent.push(
                        mdSyntax.unorderedList(nodeTitle + ' ' + nodeLink));
                }
            }else if(format.hierarchy == 3){
                mdContent.push(mdSyntax.unorderedList(nodeTitle + ' ' + nodeLink, indent));
            }else{
                indent+=1
                mdContent.push(mdSyntax.unorderedList(nodeTitle + ' ' + nodeLink, indent));
            }


            // //非叶子节点，按照标题输出，对于叶子节点，看配置，是否也按照标题输出
            // if (cnode.children && cnode.children.length>0 || program.leafTopic == 'header'){
            //     mdContent.push(mdSyntax.header(format.header, nodeTitle + ' ' + nodeLink, format.indent));
            // }
            // //如果是叶子节点，默认按照unorderedList输出
            // else {
            //     mdContent.push(mdSyntax.unorderedList(nodeTitle + ' ' + nodeLink, format.indent));
            // }

            //输出节点的图片
            mdContent.push(nodeImg);

            //输出note，按照html输出
            const notesContent = getNotes(cnode);
            if(notesContent){
                //输出的html
                mdContent.push(mdSyntax.txt(notesContent));
            }
            mdContent.push(mdSyntax.newline())
            newFormat = {hierarchy: format.hierarchy+1, header: format.header + 1, indent: indent}
        }
        recursiveToMd(cnode, mdContent, newFormat, program);
    });
}

//将节点中的图片转成md格式
function getNodeImg(node){
    const img = xmlLite.findChildNode(node.doc, {
        tagName: 'xhtml:img',
    });
    if(img) {
        const imgsrc = img.getAttribute('xhtml:src');
        return mdSyntax.img(trimNamespace(imgsrc), '');
    }
    return '';
}

//将note转换成md的格式
function getNotes(node) {
    const notesNode = xmlLite.findChildNode(node.doc, {
        tagName: 'notes',
    });
    if (notesNode) {
        const plainNotesNode = xmlLite.findChildNode(notesNode, {
            tagName: 'plain',
        });
        const htmlNotesNode = xmlLite.findChildNode(notesNode, {
            tagName: 'html',
        });
        if (htmlNotesNode && plainNotesNode) {
            plainContent = plainNotesNode.textContent;
            plainContent = trimReturn(plainContent);
            const mdContent = getMdContent(htmlNotesNode);
            return mdContent;
        }

    }
    return '';
}

//将html格式的notes内容，转化为md格式的
//这里有一个问题，notes的节点经过xml解析，每一行用一个P元素表示，每一行前缀中的空格在解析中会被丢弃
//所以需要传入plainContent，是不含标签的notes纯文本，目的是用来与方法中解析出的文本内容做比较，使能够输出完整的包括前缀空格的文本。
function getMdContent(node){
    switch(node.nodeType){
        case 1:
        case 11:
            var buf = [];
            if(node.localName == 'img'){
                const imgsrc = node.getAttribute('xhtml:src');
                buf.push(mdSyntax.img(trimNamespace(imgsrc), ''))
            }  else if(node.localName == 'a'){
                const href = node.getAttribute('xhtml:href');
                const txt = node.textContent;
                buf.push(mdSyntax.link(trimNamespace(href), txt));
            }
            if(!node.childNodes || node.childNodes.length == 0){
                buf.push(LINE_SEPARATE);
            } else {
                node = node.firstChild;
                while (node) {
                    if (node.nodeType !== 7 && node.nodeType !== 8) {
                        buf.push(getMdContent(node));
                    }
                    node = node.nextSibling;
                }
            }
            return buf.join('');
        default:
            const value = node.nodeValue;
            const index = plainContent.indexOf(value);
            const plainValue = plainContent.substr(0, index + value.length);
            plainContent = plainContent.substr(index + value.length);
            return plainValue + LINE_SEPARATE;
    }
}

//删除命名空间，这里正则写不好，用了比较笨的办法
function trimNamespace(value){
    "use strict";
    return value.replace(/(xmlns:|xhtml:|xlink:|xmap:|xmind:|urn:|content:|xap:)/g, "");
}

function selectBetterName(listOfNames){
    const nameFilter = ['Central', 'Topic', 'Central Topic', 'Map', 'Map 1', 'Sheet 1', 'Sheet 2', 'Sheet 3']
    const selectedNames = []
    _.forEach(listOfNames, function(name){
        if(!nameFilter.includes(name)){
            selectedNames.push(name)
        }
    })
    return selectedNames[0]
}

//输出换行符
function trimReturn(value){
    value = value.replace(/\r/g, '');
    value = value.replace(/\n/g, '');
    return value;
}

module.exports = xmindToMd;