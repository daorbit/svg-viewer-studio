import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Input, Select, DatePicker, message } from 'antd';
import { ArrowLeft, Clock, Calendar, Copy, Globe } from 'lucide-react';
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

const DateTimeTools = () => {
  const navigate = useNavigate();
  const [timestamp, setTimestamp] = useState(Date.now().toString());
  const [dateValue, setDateValue] = useState<Dayjs>(dayjs());
  const [date1, setDate1] = useState<Dayjs>(dayjs());
  const [date2, setDate2] = useState<Dayjs>(dayjs().add(7, 'day'));
  const [selectedTimezone, setSelectedTimezone] = useState(dayjs.tz.guess());

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland',
    'UTC',
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const convertTimestamp = (ts: string) => {
    const num = parseInt(ts);
    if (isNaN(num)) return null;
    const isSeconds = ts.length === 10;
    const timestamp = isSeconds ? num * 1000 : num;
    return dayjs(timestamp);
  };

  const timestampDate = convertTimestamp(timestamp);

  const calculateDifference = () => {
    const diff = date2.diff(date1);
    const duration = dayjs.duration(diff);
    
    return {
      days: Math.floor(duration.asDays()),
      hours: Math.floor(duration.asHours()),
      minutes: Math.floor(duration.asMinutes()),
      seconds: Math.floor(duration.asSeconds()),
      formatted: `${Math.floor(duration.asDays())}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`,
    };
  };

  const diff = calculateDifference();

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
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-base tracking-tight text-foreground">
              Date & Time Tools
            </span>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timestamp Converter */}
          <Card title="Timestamp Converter">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Unix Timestamp</label>
                <Input
                  placeholder="1234567890"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  size="large"
                />
              </div>
              {timestampDate && (
                <div className="space-y-1 pt-2">
                  <ResultRow label="Local Time" value={timestampDate.format('YYYY-MM-DD HH:mm:ss')} />
                  <ResultRow label="UTC" value={timestampDate.utc().format('YYYY-MM-DD HH:mm:ss')} />
                  <ResultRow label="ISO 8601" value={timestampDate.toISOString()} />
                  <ResultRow label="Relative" value={timestampDate.fromNow()} />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setTimestamp(Date.now().toString())}
                  className="flex-1 h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Current Timestamp
                </button>
                <button
                  onClick={() => setTimestamp(Math.floor(Date.now() / 1000).toString())}
                  className="flex-1 h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-accent transition-colors"
                >
                  Current (Seconds)
                </button>
              </div>
            </div>
          </Card>

          {/* Date to Timestamp */}
          <Card title="Date to Timestamp">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Select Date & Time</label>
                <DatePicker
                  showTime
                  value={dateValue}
                  onChange={(date) => date && setDateValue(date)}
                  style={{ width: '100%' }}
                  size="large"
                />
              </div>
              <div className="space-y-1 pt-2">
                <ResultRow label="Milliseconds" value={dateValue.valueOf().toString()} />
                <ResultRow label="Seconds" value={Math.floor(dateValue.valueOf() / 1000).toString()} />
                <ResultRow label="ISO 8601" value={dateValue.toISOString()} />
                <ResultRow label="UTC String" value={dateValue.utc().format('YYYY-MM-DD HH:mm:ss')} />
              </div>
            </div>
          </Card>

          {/* Timezone Converter */}
          <Card title="Timezone Converter">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Select Timezone
                </label>
                <Select
                  value={selectedTimezone}
                  onChange={setSelectedTimezone}
                  style={{ width: '100%' }}
                  size="large"
                  showSearch
                >
                  {timezones.map((tz) => (
                    <Select.Option key={tz} value={tz}>
                      {tz}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1 pt-2">
                <ResultRow label="Current Local" value={dayjs().format('YYYY-MM-DD HH:mm:ss')} />
                <ResultRow label={`Time in ${selectedTimezone}`} value={dayjs().tz(selectedTimezone).format('YYYY-MM-DD HH:mm:ss')} />
                <ResultRow label="UTC Offset" value={dayjs().tz(selectedTimezone).format('Z')} />
                <ResultRow label="Timezone Abbr" value={dayjs().tz(selectedTimezone).format('z')} />
              </div>
            </div>
          </Card>

          {/* Date Difference Calculator */}
          <Card title="Date Difference Calculator">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                <DatePicker
                  value={date1}
                  onChange={(date) => date && setDate1(date)}
                  style={{ width: '100%' }}
                  size="large"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                <DatePicker
                  value={date2}
                  onChange={(date) => date && setDate2(date)}
                  style={{ width: '100%' }}
                  size="large"
                />
              </div>
              <div className="space-y-1 pt-2">
                <ResultRow label="Days" value={diff.days.toString()} />
                <ResultRow label="Hours" value={diff.hours.toString()} />
                <ResultRow label="Minutes" value={diff.minutes.toString()} />
                <ResultRow label="Seconds" value={diff.seconds.toString()} />
                <ResultRow label="Formatted" value={diff.formatted} />
              </div>
            </div>
          </Card>

          {/* Current Time Info */}
          <Card title="Current Time Information">
            <div className="space-y-1">
              <ResultRow label="Local Time" value={dayjs().format('YYYY-MM-DD HH:mm:ss')} />
              <ResultRow label="UTC Time" value={dayjs().utc().format('YYYY-MM-DD HH:mm:ss')} />
              <ResultRow label="Unix Timestamp (ms)" value={Date.now().toString()} />
              <ResultRow label="Unix Timestamp (s)" value={Math.floor(Date.now() / 1000).toString()} />
              <ResultRow label="ISO 8601" value={new Date().toISOString()} />
              <ResultRow label="Day of Year" value={dayjs().dayOfYear().toString()} />
              <ResultRow label="Week of Year" value={dayjs().week().toString()} />
            </div>
          </Card>

          {/* Add/Subtract Time */}
          <Card title="Quick Date Calculations">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '+1 Hour', value: dayjs().add(1, 'hour') },
                { label: '+1 Day', value: dayjs().add(1, 'day') },
                { label: '+1 Week', value: dayjs().add(1, 'week') },
                { label: '+1 Month', value: dayjs().add(1, 'month') },
                { label: '-1 Hour', value: dayjs().subtract(1, 'hour') },
                { label: '-1 Day', value: dayjs().subtract(1, 'day') },
                { label: '-1 Week', value: dayjs().subtract(1, 'week') },
                { label: '-1 Month', value: dayjs().subtract(1, 'month') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleCopy(item.value.format('YYYY-MM-DD HH:mm:ss'))}
                  className="h-10 px-3 rounded-md text-xs font-medium border border-border hover:bg-accent transition-colors text-left"
                >
                  <div className="text-foreground font-semibold">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{item.value.format('MMM D, HH:mm')}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DateTimeTools;
