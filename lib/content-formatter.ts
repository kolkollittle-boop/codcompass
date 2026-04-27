import TurndownService from 'turndown';
import * as cheerio from 'cheerio';

/**
 * Markdown 知识库排版优化指南实现
 * 解决 HTML 抓取转换过程中的格式崩坏、样式丢失与冗余问题
 */

export class ContentFormatter {
  private turndown: TurndownService;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
      strongDelimiter: '**',
    });

    // 保护代码块：防止高亮插件的 span 干扰
    this.turndown.addRule('code-blocks', {
      filter: (node: any) => {
        return (
          node.nodeName === 'PRE' &&
          (node.className.includes('hljs') ||
            node.className.includes('language') ||
            node.className.includes('code'))
        );
      },
      replacement: (content: string, node: any) => {
        const lang = node.className.match(/language-(\w+)/)?.[1] || '';
        // 提取纯文本，避免内部 span 污染
        const text = (node as HTMLElement).innerText || content;
        return `\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n`;
      },
    });

    // 表格转换优化
    this.turndown.addRule('tables', {
      filter: 'table',
      replacement: (content: string, node: any) => {
        return '\n' + this.tableToMarkdown(node) + '\n';
      },
    });
  }

  /**
   * 第一步：精细化预处理 (Pre-cleaning)
   * 剔除交互与广告元素，移除所有 class 和 id 属性
   */
  private cleanHtml(html: string): string {
    const $ = cheerio.load(html);

    // 1. 剔除干扰项
    $('script, style, button, input, form, aside, nav, header, footer, .ad, .advertisement').remove();

    // 2. 移除 class/id (防止 MD 转换误判)
    $('*').each((_, el) => {
      $(el).removeAttr('class');
      $(el).removeAttr('id');
      $(el).removeAttr('style');
    });

    return $.html();
  }

  /**
   * 表格转 Markdown 的简单实现
   * 如果 turndown 处理不好表格，用正则补强
   */
  private tableToMarkdown(node: any): string {
    // node is an HTMLElement. Re-parse it locally to avoid scope issues.
    const $table = cheerio.load(node.outerHTML || '');
    let md = '';
    $table('tr').each((i, row) => {
      const cells: string[] = [];
      $table(row).find('td, th').each((_, cell) => {
        cells.push($table(cell).text().trim());
      });
      if (cells.length > 0) {
        md += '| ' + cells.join(' | ') + ' |\n';
        if (i === 0) {
          md += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
        }
      }
    });
    return md.trim();
  }

  /**
   * 核心转换：HTML -> Markdown
   */
  public convert(html: string): string {
    const cleaned = this.cleanHtml(html);
    return this.turndown.turndown(cleaned);
  }

  /**
   * 第三步：后处理 (Post-processing)
   * 1. 相对路径补全
   * 2. 清理多余空行
   * 3. 修复代码块
   * 4. 盘古之白 (中英文间距)
   */
  public postProcess(md: string, baseUrl: string = ''): string {
    let content = md;

    // 1. 修复相对路径 (图片/链接)
    if (baseUrl) {
      const url = new URL(baseUrl);
      const base = `${url.protocol}//${url.host}`;
      // src="/path" -> src="https://domain/path"
      content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        if (src.startsWith('http') || src.startsWith('data:')) return match;
        if (src.startsWith('/')) return `![${alt}](${base}${src})`;
        return `![${alt}](${url.origin}/${src})`;
      });
      // [text](/path) -> [text](https://domain/path)
      content = content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, href) => {
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return match;
        if (href.startsWith('/')) return `[${text}](${base}${href})`;
        return `[${text}](${url.origin}/${href})`;
      });
    }

    // 2. 限制连续换行
    content = content.replace(/\n{3,}/g, '\n\n');

    // 3. 修复代码块 (确保闭合)
    const codeBlocks = content.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block) => {
        if (!block.endsWith('```')) {
          content = content.replace(block, block + '\n```');
        }
      });
    }

    // 4. 盘古之白 (中英文混排间距)
    // 汉字与英文/数字之间加空格
    content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
    content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');

    return content.trim();
  }
}
