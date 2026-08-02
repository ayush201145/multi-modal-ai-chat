"use client";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Bot } from "lucide-react";

function MessageBubble({ message, index }) {
  const isUser = message.role === "user";
  const [copiedBlock, setCopiedBlock] = useState(null);

  const copyCode = (code, blockIndex) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(blockIndex);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  let codeBlockIndex = 0;

  return (
    <motion.div
      className={`message ${isUser ? "message-user" : "message-assistant"}`}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`message-avatar ${isUser ? "message-avatar-user" : "message-avatar-ai"}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-content">
        <div className="message-role">{isUser ? "You" : "Assistant"}</div>
        <div className="message-body">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  if (!inline && (match || codeString.includes("\n"))) {
                    const currentIndex = codeBlockIndex++;
                    const language = match ? match[1] : "text";

                    return (
                      <div className="code-block">
                        <div className="code-block-header">
                          <span className="code-block-lang">{language}</span>
                          <button
                            className="code-copy-btn"
                            onClick={() => copyCode(codeString, currentIndex)}
                          >
                            {copiedBlock === currentIndex ? (
                              <>
                                <Check size={14} />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={language}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: "0 0 12px 12px",
                            fontSize: "13px",
                            background: "#1a1b26",
                          }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>;
                },
                a({ href, children }) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="message-link">
                      {children}
                    </a>
                  );
                },
                blockquote({ children }) {
                  return <blockquote className="message-blockquote">{children}</blockquote>;
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto mb-3">
                      <table className="message-table">{children}</table>
                    </div>
                  );
                },
                th({ children }) {
                  return <th className="message-th">{children}</th>;
                },
                td({ children }) {
                  return <td className="message-td">{children}</td>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(MessageBubble);
