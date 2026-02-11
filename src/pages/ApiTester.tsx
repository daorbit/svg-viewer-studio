/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Input, Select, message, Tabs } from 'antd';
import { ArrowLeft, Send, Copy, Trash2, Plus, X } from 'lucide-react';

const { TextArea } = Input;

interface Header {
  key: string;
  value: string;
}

interface ApiRequest {
  method: string;
  url: string;
  headers: Header[];
  body: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const ApiTester = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('body');

  const handleSend = async () => {
    if (!url.trim()) {
      message.error('Please enter a URL');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const validHeaders: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          validHeaders[h.key] = h.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: validHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
      });

      message.success('Request completed!');
    } catch (error: any) {
      message.error(error.message || 'Request failed');
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: error.message,
        time: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const formatBody = () => {
    try {
      if (body.trim()) {
        const parsed = JSON.parse(body);
        setBody(JSON.stringify(parsed, null, 2));
        message.success('JSON formatted!');
      }
    } catch {
      message.error('Invalid JSON');
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    if (status >= 500) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip title="Back to Home">
              <button
                onClick={() => navigate('/')}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Tooltip>
            <div className="w-px h-5 bg-border" />
            <Send className="w-4 h-4 text-primary" />
            <span className="font-semibold text-base tracking-tight text-foreground">
              HTTP/API Tester
            </span>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
        {/* Request panel */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Request</h3>
          
          {/* URL bar */}
          <div className="flex gap-2 mb-4">
            <Select
              value={method}
              onChange={setMethod}
              style={{ width: 120 }}
              size="large"
            >
              {HTTP_METHODS.map(m => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
            </Select>
            <Input
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              size="large"
              onPressEnter={handleSend}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="h-10 px-6 rounded-md text-sm font-medium flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'body',
                label: 'Body',
                children: (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground">Request Body (JSON)</label>
                      <button
                        onClick={formatBody}
                        className="h-6 px-2 rounded text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        Format JSON
                      </button>
                    </div>
                    <TextArea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={8}
                      style={{
                        fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
                        fontSize: 13,
                      }}
                    />
                  </div>
                ),
              },
              {
                key: 'headers',
                label: `Headers (${headers.filter(h => h.key && h.value).length})`,
                children: (
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Header Key"
                          value={header.key}
                          onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                        />
                        <Input
                          placeholder="Header Value"
                          value={header.value}
                          onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                        />
                        <button
                          onClick={() => handleRemoveHeader(index)}
                          className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddHeader}
                      className="h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1 text-foreground border border-border hover:bg-accent transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Header
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Response panel */}
        {response && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Response</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className={`font-semibold ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-muted-foreground">
                  Time: {response.time}ms
                </span>
                <button
                  onClick={() => handleCopy(typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2))}
                  className="h-6 px-2 rounded flex items-center gap-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>

            <Tabs
              items={[
                {
                  key: 'body',
                  label: 'Body',
                  children: (
                    <div className="bg-muted rounded p-3 overflow-x-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {typeof response.data === 'string' 
                          ? response.data 
                          : JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  ),
                },
                {
                  key: 'headers',
                  label: `Headers (${Object.keys(response.headers).length})`,
                  children: (
                    <div className="space-y-1">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex gap-2 py-1 border-b border-border last:border-0">
                          <span className="text-xs font-medium text-foreground min-w-[200px]">{key}:</span>
                          <span className="text-xs text-muted-foreground font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTester;
