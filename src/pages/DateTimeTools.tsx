import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Input, Select, DatePicker, message, Tabs } from 'antd';
import { ArrowLeft, Clock, Copy, Plus, X, Check } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(dayOfYear);
dayjs.extend(weekOfYear);

interface ConvertedTime {
  timezone: string;
  time: string;
  offset: string;
}

const DateTimeTools = () => {
  const navigate = useNavigate();
  
  // Time Converter states
  const [inputTime, setInputTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  const [fromTimezone, setFromTimezone] = useState(dayjs.tz.guess());
  const [targetTimezones, setTargetTimezones] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [outputFormat, setOutputFormat] = useState('24');
  const [convertedTimes, setConvertedTimes] = useState<ConvertedTime[]>([]);
  const [newTimezone, setNewTimezone] = useState('');
  
  // Timestamp Converter states
  const [timestamp, setTimestamp] = useState(Date.now().toString());
  const [timestampTimezone, setTimestampTimezone] = useState(dayjs.tz.guess());
  const [timestampResult, setTimestampResult] = useState<{
    iso: string;
    localized: string;
    relative: string;
    dayOfYear: string;
    weekOfYear: string;
  } | null>(null);
  
  // Date Calculator states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateDiff, setDateDiff] = useState<{
    days: string;
    businessDays: string;
    weeks: string;
    months: string;
    years: string;
  } | null>(null);
  
  // Toast state
  const [copySuccess, setCopySuccess] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'America/Toronto',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Moscow',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Seoul',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'UTC',
  ];

  const handleConvertTime = () => {
    try {
      const sourceTime = dayjs.tz(inputTime, fromTimezone);
      
      if (!sourceTime.isValid()) {
        message.error('Invalid date/time format');
        return;
      }

      const results: ConvertedTime[] = targetTimezones.map(tz => {
        const converted = sourceTime.tz(tz);
        const format24 = 'YYYY-MM-DD HH:mm:ss';
        const format12 = 'YYYY-MM-DD hh:mm:ss A';
        
        return {
          timezone: tz,
          time: converted.format(outputFormat === '24' ? format24 : format12),
          offset: converted.format('Z'),
        };
      });

      setConvertedTimes(results);
      message.success('Time converted successfully!');
    } catch (error) {
      message.error('Error converting time');
    }
  };

  const handleAddTargetTimezone = () => {
    if (newTimezone && !targetTimezones.includes(newTimezone)) {
      setTargetTimezones([...targetTimezones, newTimezone]);
      setNewTimezone('');
    }
  };

  const handleRemoveTargetTimezone = (tz: string) => {
    setTargetTimezones(targetTimezones.filter(t => t !== tz));
  };

  const handleSetNow = () => {
    setInputTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  };

  const handleTimestampConvert = () => {
    try {
      const num = parseInt(timestamp);
      if (isNaN(num)) {
        message.error('Invalid timestamp');
        return;
      }
      
      const isSeconds = timestamp.length === 10;
      const ts = isSeconds ? num * 1000 : num;
      const date = dayjs(ts).tz(timestampTimezone);
      
      setTimestampResult({
        iso: date.toISOString(),
        localized: date.format('MMMM D, YYYY h:mm:ss A'),
        relative: date.fromNow(),
        dayOfYear: date.dayOfYear().toString(),
        weekOfYear: date.week().toString(),
      });
      
      message.success('Timestamp converted!');
    } catch (error) {
      message.error('Error converting timestamp');
    }
  };

  const handleDateCalculate = () => {
    try {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      
      if (!start.isValid() || !end.isValid()) {
        message.error('Invalid date format');
        return;
      }
      
      const diff = end.diff(start, 'day');
      const duration = dayjs.duration(end.diff(start));
      
      // Calculate business days (excluding weekends)
      let businessDays = 0;
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        if (current.day() !== 0 && current.day() !== 6) {
          businessDays++;
        }
        current = current.add(1, 'day');
      }
      
      setDateDiff({
        days: Math.abs(diff).toString(),
        businessDays: businessDays.toString(),
        weeks: Math.abs(Math.floor(duration.asWeeks())).toString(),
        months: Math.abs(end.diff(start, 'month')).toString(),
        years: Math.abs(end.diff(start, 'year')).toString(),
      });
      
      message.success('Date difference calculated!');
    } catch (error) {
      message.error('Error calculating date difference');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );

  const ResultRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{value}</code>
        <button
          onClick={() => handleCopy(value)}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const timeConverterTab = (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">World Time Converter</h3>
          <p className="text-sm text-muted-foreground mb-6">Convert time between any time zones around the world</p>
          
          <div className="space-y-4">
            {/* Enter Time */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Enter Time</label>
              <div className="flex gap-2">
                <Input
                  placeholder="2026-02-11T06:47:21.077Z"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  size="large"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleSetNow}
                  className="h-10 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
                >
                  Now
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Accepts ISO 8601 format or simple date format</p>
            </div>

            {/* From Time Zone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">From Time Zone</label>
              <Select
                value={fromTimezone}
                onChange={setFromTimezone}
                size="large"
                style={{ width: '100%' }}
                showSearch
              >
                {timezones.map(tz => (
                  <Select.Option key={tz} value={tz}>
                    {tz}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Target Time Zones */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Target Time Zones</label>
              <div className="space-y-2">
                {targetTimezones.map((tz, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={tz}
                      onChange={(value) => {
                        const updated = [...targetTimezones];
                        updated[index] = value;
                        setTargetTimezones(updated);
                      }}
                      size="large"
                      style={{ flex: 1 }}
                      showSearch
                    >
                      {timezones.map(t => (
                        <Select.Option key={t} value={t}>
                          {t}
                        </Select.Option>
                      ))}
                    </Select>
                    <button
                      onClick={() => handleRemoveTargetTimezone(tz)}
                      className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Select
                    value={newTimezone}
                    onChange={setNewTimezone}
                    size="large"
                    placeholder="Select timezone to add"
                    style={{ flex: 1 }}
                    showSearch
                  >
                    {timezones.filter(tz => !targetTimezones.includes(tz)).map(tz => (
                      <Select.Option key={tz} value={tz}>
                        {tz}
                      </Select.Option>
                    ))}
                  </Select>
                  <button
                    onClick={handleAddTargetTimezone}
                    disabled={!newTimezone}
                    className="h-10 px-4 rounded-md text-sm font-medium border border-border hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Output Format */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Output Format</label>
              <Select
                value={outputFormat}
                onChange={setOutputFormat}
                size="large"
                style={{ width: '100%' }}
              >
                <Select.Option value="24">24-hour (HH:mm:ss)</Select.Option>
                <Select.Option value="12">12-hour (hh:mm:ss AM/PM)</Select.Option>
              </Select>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvertTime}
              className="w-full h-12 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Convert Time
            </button>
          </div>
        </div>

        {/* Right Panel - Converted Times */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Converted Times</h3>
            <div className="text-xs text-muted-foreground">
              {fromTimezone.split('/')[1]?.replace('_', ' ')}: {dayjs().tz(fromTimezone).format('HH:mm:ss')}
            </div>
          </div>

          {convertedTimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="w-12 h-12 text-muted-foreground opacity-20 mb-3" />
              <p className="text-sm text-muted-foreground">No conversions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {convertedTimes.map((ct, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {ct.timezone.split('/')[1]?.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-muted-foreground">{ct.timezone}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(ct.time)}
                      className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-background transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-base font-semibold font-mono text-primary">
                      {ct.time}
                    </code>
                    <span className="text-xs text-muted-foreground font-mono">
                      UTC{ct.offset}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const utilitiesTab = (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timestamp Converter */}
        <Card title="Timestamp Converter">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Unix Timestamp (ms)</label>
              <Input
                type="number"
                placeholder="1707644841077"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Timezone</label>
              <Select
                value={timestampTimezone}
                onChange={setTimestampTimezone}
                size="large"
                style={{ width: '100%' }}
                showSearch
              >
                {timezones.map(tz => (
                  <Select.Option key={tz} value={tz}>
                    {tz}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <button
              onClick={handleTimestampConvert}
              className="w-full h-10 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
            >
              Convert
            </button>
            {timestampResult && (
              <div className="mt-4 space-y-1">
                <ResultRow label="ISO 8601" value={timestampResult.iso} />
                <ResultRow label="Localized" value={timestampResult.localized} />
                <ResultRow label="Relative" value={timestampResult.relative} />
                <ResultRow label="Day of Year" value={timestampResult.dayOfYear} />
                <ResultRow label="Week of Year" value={timestampResult.weekOfYear} />
              </div>
            )}
          </div>
        </Card>

        {/* Date Calculator */}
        <Card title="Date Calculator">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Start Date</label>
              <Input
                placeholder="2024-01-01"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">End Date</label>
              <Input
                placeholder="2024-12-31"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="large"
              />
            </div>
            <button
              onClick={handleDateCalculate}
              className="w-full h-10 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
            >
              Calculate
            </button>
            {dateDiff && (
              <div className="mt-4 space-y-1">
                <ResultRow label="Total Days" value={dateDiff.days} />
                <ResultRow label="Business Days" value={dateDiff.businessDays} />
                <ResultRow label="Weeks" value={dateDiff.weeks} />
                <ResultRow label="Months" value={dateDiff.months} />
                <ResultRow label="Years" value={dateDiff.years} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
 
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultActiveKey="converter" size="large">
          <Tabs.TabPane tab="Time Converter" key="converter">
            {timeConverterTab}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Utilities" key="utilities">
            {utilitiesTab}
          </Tabs.TabPane>
        </Tabs>

        {/* Toast Notifications */}
        {copySuccess && (
          <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Copied to clipboard!</span>
          </div>
        )}
      </main>
    </div>
  );
 
};
export default DateTimeTools;