import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as strftimeLT from 'strftime';
import * as classNames from 'classnames';
import * as W from './Weather';
import langs from './langs/zh-CN';
import 'normalize.css';
import './app.css';

const _t = (s: string) => langs[s] || s;
const format = (template: string, args: { [index: string]: string | number }): string =>
  template.replace(/{(\w+)}/g, (match, key) => args[key] as string);

let strftime = strftimeLT;

interface Condition {
  event: keyof typeof events | null;
  zone: W.Zone | null,
  desiredWeathers: number[],
  previousWeathers: number[],
  beginHour: number,
  endHour: number,
}

interface AppState extends Condition {
  hoverHour: number | null,
  showCount: number,
}

class App extends React.Component<any, AppState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      ...parseHash(window.location.hash),
      hoverHour: null,
      showCount: 11,
    };
  }
  public render() {
    const { event, zone, desiredWeathers, previousWeathers, beginHour, endHour, hoverHour, showCount } = this.state;
    strftime = strftimeLT;
    if (event !== null) {
      strftime = strftime.timezone(+480) as any;
      const matches = events[event].matcher();
      return (
        <div className="app">
          <div className="console clearfix">
            <span className="console_summary">{events[event].description}</span>
            <span className="console_timezone">UTC+08:00</span>
          </div>
          <div className="match">
            <table>
              <thead>
              <tr>
                <th className="match_event-start-time">{_t('Start Time')}</th>
                <th className="match_event-end-time">{_t('End Time')}</th>
              </tr>
              </thead>
              <tbody>
              {matches.slice(0, 20).map((x, i) => (
                <tr key={i}>
                  <td className="match_event-start-time">
                    <span className="match_local-time-date">{strftime('%m/%d ', x.begin)}</span>
                    <FriendlyTime date={x.begin} />
                  </td>
                  <td className="match_event-end-time">
                    <span className="match_local-time-date">{strftime('%m/%d ', x.end)}</span>
                    <FriendlyTime date={x.end} />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    const matches = zone ? W.find({ zone, desiredWeathers, previousWeathers, beginHour, endHour }) : [];
    const list = zone && matches.length === 1 ? W.find({ zone, hourMask: { 0: true, 8: true, 16: true } }) : [];
    return (
      <div className="app">
        <div className="event">
        <div className="event_zone">
            <div className="condition-title">
              <span>{'ULK财富密码实时播报'}</span>
              <span className="g-pointer" onClick={()=>{
                const input = document.createElement('textarea');
                document.body.appendChild(input);
                input.value = ulkCfmm()
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
              }}>{'(点击复制)'}</span>
            </div>
            <span className="g-break-spaces" id="cfmm">{ulkCfmm()}</span>
          </div>
        </div>
        <div className="condition">
          <div className="condition_zone">
            <span className="condition-title">
              {_t(zone ? 'Zone' : '请选择一个地区')}
            </span>
            {groupedZones.map((g, i) => (
              <span key={i} className="condition_zone-group">
                {g.map(z => (
                  <span
                    key={z}
                    className={classNames('condition_zone-item', zone === z && '-active')}
                    onClick={() => this.setState({
                      zone: z,
                      desiredWeathers: [],
                      previousWeathers: [],
                      beginHour: 0,
                      endHour: 23,
                      hoverHour: null,
                      showCount: 11,
                    })}
                    children={_t(z)}
                  />
                ))}
              </span>
            ))}
          </div>
          {zone && <>
            <div className="condition_weather">
              <span className="condition-title">
                {_t('Weather')}
                <span className="condition-tip">{_t('右击多选')}</span>
              </span>
              <span
                className="condition_weather-selector"
                onContextMenu={e => e.preventDefault()}
              >
                <span
                  className={classNames('condition_weather-item', desiredWeathers.length === 0 && '-active')}
                  onClick={() => this.setState({ desiredWeathers: [] })}
                  onContextMenu={() => this.setState({ desiredWeathers: [] })}
                  children={_t('Any')}
                />
                {zone && W.zoneWeathers[zone].map((x, i) => (
                  <span
                    key={i}
                    className={classNames('condition_weather-item', desiredWeathers.indexOf(i) !== -1 && '-active')}
                    onClick={() => this.setState({ desiredWeathers: [i] })}
                    onContextMenu={() => this.setState({ desiredWeathers: toggleWeather(desiredWeathers, i) })}
                    children={_t(x)}
                  />
                ))}
              </span>
            </div>
            <div className="condition_weather">
              <span className="condition-title">
                {_t('Previous Weather')}
                <span className="condition-tip">{_t('右击多选')}</span>
              </span>
              <span
                className="condition_weather-selector"
                onContextMenu={e => e.preventDefault()}
              >
                <span
                  className={classNames('condition_weather-item', previousWeathers.length === 0 && '-active')}
                  onClick={() => this.setState({ previousWeathers: [] })}
                  onContextMenu={() => this.setState({ previousWeathers: [] })}
                  children={_t('Any')}
                />
                {zone && W.zoneWeathers[zone].map((x, i) => (
                  <span
                    key={i}
                    className={classNames('condition_weather-item', previousWeathers.indexOf(i) !== -1 && '-active')}
                    onClick={() => this.setState({ previousWeathers: [i] })}
                    onContextMenu={() => this.setState({ previousWeathers: toggleWeather(previousWeathers, i) })}
                    children={_t(x)}
                  />
                ))}
              </span>
            </div>
            <div className="condition_time">
              <span className="condition-title">
                {_t('Time')}
                <span className="condition-tip">{_t('点击开始时间然后选择一个时间段')}</span>
              </span>
              <div className="condition_time-selector">
                {Array.from({ length: 24 }, (x, i) => (
                  <span
                    key={i}
                    className={classNames(
                      'condition_time-item',
                      W.isHourIn(beginHour, endHour, i) && '-active',
                      hoverHour !== null && W.isHourIn(beginHour, hoverHour, i) && '-hover',
                    )}
                    onClick={() => {
                      if (hoverHour === null) {
                        this.setState({
                          beginHour: i,
                          endHour: i,
                          hoverHour: i,
                        });
                      } else {
                        this.setState({
                          endHour: i,
                          hoverHour: null,
                        });
                      }
                    }}
                    onMouseEnter={() => {
                      if (hoverHour !== null) {
                        this.setState({ hoverHour: i });
                      }
                    }}
                    children={i}
                  />
                ))}
              </div>
            </div>
          </>}
        </div>
        {matches.length > 1 && (
          <div className="console clearfix">
            <span className="console_summary">
              {format(_t('未来 {future} 地球天内共有 {count} 个时段符合条件'),
                { future: W.future, count: matches.length })}
            </span>
          </div>
        )}
        {matches.length > 1 && (
          <div className="match">
            <table>
              <thead>
              <tr>
                <th className="match_local-time">{_t('Local Time')}</th>
                <th className="match_eorzea-time">{_t('Eorzea Time')}</th>
                <th className="match_weathers">{_t('Weathers')}</th>
              </tr>
              </thead>
              <tbody>
              {matches.slice(0, showCount).map(x => x()).map((x, i) => (
                <tr key={i}>
                  <td className="match_local-time">
                    <span className="match_local-time-date">{strftime('%m/%d ', x.begin)}</span>
                    <FriendlyTime date={x.begin} />
                    <span className="match_local-time-separator">-</span>
                    <FriendlyTime date={x.end} />
                  </td>
                  <td className="match_eorzea-time">
                    <span className="match_eorzea-time-date">{formatEorzeaDate(x.begin)}</span>
                    {formatEorzeaTime(x.begin)}, {x.duration}h
                  </td>
                  <td className="match_weathers">
                    <Weathers weathers={x.weathers} max={4} />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
        {matches.length === 1 && (
          <div className="console clearfix">
            <span className="console_summary">
              {_t('正在展示未来的天气序列，选择一些条件可以查询符合的时段')}
            </span>
          </div>
        )}
        {matches.length === 1 && (
          <div className="match list">
            <table>
              <thead>
              <tr>
                <th />
                <th>ET 0:00</th>
                <th>ET 8:00</th>
                <th>ET 16:00</th>
              </tr>
              </thead>
              <tbody>
              {Array.from({ length: Math.min(showCount, Math.floor(list.length / 3)) },
                (x, i) => i * 3 - list[0]().begin.valueOf() / 2 % 3).map(i => (
                <tr key={i}>
                  <td className="match_list-date">{strftime('%m/%d', list[i < 0 ? 0 : i]().begin)}</td>
                  {[i, i + 1, i + 2].map(j => j >= 0 && list[j]()).map((x, j) => x ? (
                    <td key={j}>
                      <span className="match_list-time"><FriendlyTime date={x.begin} /></span>
                      <span className="match_list-weather">{_t(x.weathers[1])}</span>
                    </td>
                  ) : <td key={j} />)}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
        {showCount < (matches.length === 1 ? Math.floor(list.length / 3) : matches.length) && (
          <div className="more">
            <div className="more_button" onClick={() => this.setState({ showCount: showCount * 2 })}>
              {_t('Show more')}
            </div>
          </div>
        )}
        <div className="footer">
          {_t('FFXIV Weather Bell')} 2021
          <span className="footer_separator">·</span>
          <a href="https://github.com/Asvel/ffxiv-weather-bell/blob/master/LICENSE.txt">License</a>
          <span className="footer_separator">·</span>
          <a href="https://github.com/Asvel/ffxiv-weather-bell">Code fork from Asvel</a>
        </div>
      </div>
    );
  }
  public componentDidMount() {
    W.init();  // improve first searching response speed
    window.addEventListener('hashchange', () => {
      if (formatHash(this.state) !== window.location.hash) {
        this.setState(parseHash(window.location.hash));
      }
    }, false);
  }
  public componentDidUpdate() {
    window.location.hash = formatHash(this.state);
  }
}

class FriendlyTime extends React.Component<{ date: Date }> {
  public render() {
    const { date } = this.props;
    return (
      <>
        <span>{strftime('%H:%M', date)}</span>
        <span className="friendly-time_seconds">{strftime(':%S', date)}</span>
      </>
    );
  }
}

interface WeathersProps {
  weathers: string[],
  max: number,
  className?: string,
}

class Weathers extends React.Component<WeathersProps> {
  public render() {
    let { weathers, max, className } = this.props;
    className = classNames(className, 'weathers');
    return weathers.length <= max ? (
      <span className={className}>
        {weathers.map((x, i) => (
          <span key={i}>{_t(x)}</span>
        ))}
      </span>
    ) : (
      <span className={className}>
        {weathers.slice(0, max - 2).map((x, i) => (
          <span key={i}>{_t(x)}</span>
        ))}
        <span>...</span>
        <span>{_t(weathers[weathers.length - 1])}</span>
      </span>
    );
  }
}

const groupedZones: W.Zone[][] = [
  ['Limsa Lominsa', 'Middle La Noscea', 'Lower La Noscea', 'Eastern La Noscea',
    'Western La Noscea', 'Upper La Noscea', 'Outer La Noscea', 'The Mist'],
  ['Gridania', 'Central Shroud', 'East Shroud', 'South Shroud', 'North Shroud',
    'The Lavender Beds'],
  ['Ul\'dah', 'Western Thanalan', 'Central Thanalan', 'Eastern Thanalan',
    'Southern Thanalan', 'Northern Thanalan', 'The Goblet'],
  ['Ishgard', 'Coerthas Central Highlands', 'Coerthas Western Highlands'],
  ['The Sea of Clouds', 'Azys Lla', 'The Diadem'],
  ['Idyllshire', 'The Dravanian Forelands', 'The Dravanian Hinterlands', 'The Churning Mists'],
  ['Rhalgr\'s Reach', 'The Fringes', 'The Peaks', 'The Lochs'],
  ['Kugane', 'Shirogane'],
  ['The Ruby Sea', 'Yanxia', 'The Azim Steppe'],
  ['The Crystarium', 'Eulmore', 'Lakeland', 'Kholusia', 'Amh Araeng', 'Il Mheg',
    'The Rak\'tika Greatwood', 'The Tempest'],
  ['Mor Dhona'],
  ['Eureka Anemos', 'Eureka Pagos', 'Eureka Pyros', 'Eureka Hydatos'],
  ['Bozjan Southern Front', 'Zadnor'],
];

const zoneShorthands = {} as { [index in W.Zone]: string };
const shorthandZones = {} as { [index: string]: W.Zone };
(() => {
  const wordCounts: { [index: string]: number }[] = [{}, {}, {}];
  const shorthands = W.zones
    .map(zone => {
      let parts = zone.replace(/[^\w ]/g, '').split(' ');
      parts = parts[0] === 'The' ? parts.slice(1) : parts;
      for (let i = 0; i < parts.length; i++) {
        wordCounts[i][parts[i]] = (wordCounts[i][parts[i]] || 0) + 1;
      }
      return parts;
    })
    .map(parts => {
      let shorthand;
      if (wordCounts[0][parts[0]] > 1 || wordCounts[1][parts[1]] > 1) {
        shorthand = parts[0].slice(0, 2) + parts[1].slice(0, 2);
      } else {
        shorthand = parts.join('').slice(0, 4);
      }
      return shorthand.toLowerCase();
    });
  for (let i = 0; i < W.zones.length; i++) {
    zoneShorthands[W.zones[i]] = shorthands[i];
    shorthandZones[shorthands[i]] = W.zones[i];
  }
})();

const events = {
  garlok: {
    description: _t('伽洛克 - 天气保持薄雾、碧空、晴朗、阴云200分钟时开始，不再是这些天气时结束。'),
    matcher: () => W
      .find({
        zone: 'Eastern La Noscea',
        desiredWeathers: [0, 1, 2, 3],
      })
      .map(m => {
        const match = m(true);
        match.begin.setMinutes(match.begin.getMinutes() + 200);
        return match;
      })
      .filter(m => m.begin < m.end),
  },
  laideronnette: {
    description: _t('雷德罗巨蛇 - 天气保持小雨30分钟时开始，天气不再是小雨时结束。'),
    matcher: () => W
      .find({
        zone: 'Central Shroud',
        desiredWeathers: [1],
      })
      .map(m => {
        const match = m(true);
        match.begin.setMinutes(match.begin.getMinutes() + 30);
        return match;
      })
      .filter(m => m.begin < m.end),
  },
};

function parseHash(hash: string): Condition {
  const [ zone, desiredWeathers, previousWeathers, beginHour, endHour ] = hash.slice(1).split('-');
  return {
    event: zone in events ? zone as any : null,
    zone: shorthandZones[zone] || null,
    desiredWeathers: desiredWeathers ? desiredWeathers.split('').map(Number) : [],
    previousWeathers: previousWeathers ? previousWeathers.split('').map(Number) : [],
    beginHour: Number(beginHour || 0),
    endHour: Number(endHour || 23),
  };
}
function formatHash(condition: Condition): string {
  if (condition.event !== null) return '#' + condition.event;
  if (!condition.zone) return '';
  const zone = zoneShorthands[condition.zone];
  const desiredWeathers = condition.desiredWeathers.sort((a, b) => a - b).join('');
  const previousWeathers = condition.previousWeathers.sort((a, b) => a - b).join('');
  const parts = [zone, desiredWeathers, previousWeathers, condition.beginHour, condition.endHour];
  const defaults = [null, '', '', 0, 23];
  while (parts[parts.length - 1] === defaults[parts.length - 1]) parts.length--;
  return '#' + parts.join('-');
}

function toggleWeather(weathers: number[], weather: number): number[] {
  const index = weathers.indexOf(weather);
  if (index === -1) {
    return weathers.concat([weather]);
  } else {
    return weathers.slice(0, index).concat(weathers.slice(index + 1));
  }
}

const padZero = (n: number) => n < 10 ? '0' + n : n;
function formatEorzeaDate(date: Date): string {
  const dayCount = Math.floor(date.valueOf() / (1000 * 175 * 24));
  const day = dayCount % 32;
  const monthCount = Math.floor(dayCount / 32);
  const month = monthCount % 12;
  return `${padZero(month + 1)}/${padZero(day + 1)}`;
}
function formatEorzeaTime(date: Date): string {
  const minuteCount = Math.floor(date.valueOf() / (1000 * 175) * 60);
  const minute = minuteCount % 60;
  const hourCount = Math.floor(minuteCount / 60);
  const hour = hourCount % 24;
  return `${padZero(hour)}:${padZero(minute)}`;
}

document.title = _t('FFXIV Weather Bell');

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<App />, container);

// const ulkZones: string[][] = [['冰岛薄雾','冰岛暴雪','火岛暴雪']]
function ulkCfmm() {
  const ulkFilte = (condition: { zone: W.Zone; desiredWeathers: number[] }) => {
    const arr = W.find(condition)
      .map((m) => {
        const match = m(false);
        return match;
      })
      .slice(0, 8)
      .filter((m) => m.begin.getDate() === new Date().getDate());
    return arr.map((e) => strftime('%H:%M', e.begin)).join(" ");
  };

  const PagosFog = ulkFilte({
    zone: "Eureka Pagos",
    desiredWeathers: [1],
  });

  const PagosBlizzards = ulkFilte({
    zone: "Eureka Pagos",
    desiredWeathers: [5],
  });

  const PyrosBlizzards = ulkFilte({
    zone: "Eureka Pyros",
    desiredWeathers: [3],
  });
  const CFMM = `冰岛薄雾：${PagosFog}\n冰岛暴雪：${PagosBlizzards}\r\n火岛暴雪：${PyrosBlizzards}`;
  return CFMM
}

