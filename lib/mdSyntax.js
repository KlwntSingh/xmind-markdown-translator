/**
 * Created by shaoyin.zj on 17/1/9.
 */

const END_LINE_SEPARATE = '  \r\n';
const START_LINE_SEPARATE = '';
const TAB = '\t';

//构建md格式的工具类
class MdSyntax{
    header(depth, txt, indent=0){
        if(depth == 1){
            return this.header1(txt);
        } else if(depth == 2){
            return this.header2(txt);
        } else if(depth == 3){
            return this.header3(txt, indent);
        } else if(depth == 4){
            return this.header4(txt, indent);
        } else if(depth == 5){
            return this.header5(txt, indent);
        } else if(depth == 6){
            return this.header6(txt, indent);
        }
        else{
            return this.txt(txt);
        }
    }
    header1(txt, depth=0){
        return START_LINE_SEPARATE + this.indent(depth) + '# ' + txt + END_LINE_SEPARATE;
    }
    header2(txt, depth=0){
        return START_LINE_SEPARATE + this.indent(depth) + '## ' + txt + END_LINE_SEPARATE;
    }
    header3(txt, depth=0){
        return START_LINE_SEPARATE + this.indent(depth) + '### ' + txt + END_LINE_SEPARATE;
    }
    header4(txt, depth=0){
        return START_LINE_SEPARATE + this.indent(depth) + '#### ' + txt + END_LINE_SEPARATE;
    }
    header5(txt, depth=0){
        return START_LINE_SEPARATE + this.indent(depth) + '##### ' + txt + END_LINE_SEPARATE;
    }
    header6(txt, depth=0){
        return START_LINE_SEPARATE + this.indent(depth) + '###### ' + txt + END_LINE_SEPARATE;
    }
    img(src, txt){
        return '!['+txt+']('+src+' "'+txt+'")';
    }
    link(src, txt){
        return '['+txt+']('+src+' "'+txt+'")';
    }
    emphasize(txt){
        return '*' + txt + '*';
    }
    strong(txt){
        return '**' + txt + '**';
    }
    html(txt){
        return txt + END_LINE_SEPARATE;
    }
    txt(txt){
        return txt + END_LINE_SEPARATE;
    }
    blockCode(txt){
        return START_LINE_SEPARATE + '```' + START_LINE_SEPARATE + txt + START_LINE_SEPARATE + '```' + END_LINE_SEPARATE;
    }
    inlineCode(txt){
        return '`' + txt + '`';
    }
    orderedList(num, txt, depth){
        return START_LINE_SEPARATE + (this.indent(depth)+ '. ' + txt) + END_LINE_SEPARATE;
    }
    unorderedList(txt, depth){
        return START_LINE_SEPARATE + (this.indent(depth) + '* ' + txt) + END_LINE_SEPARATE;
    }
    indent(indent){
        let indentation = ''
        for(let i =0; i<indent;i++){
            indentation += TAB
        }
        return indentation
    }
}


module.exports = MdSyntax;