(function(root,factory){
  const model=factory();
  if(typeof module==='object'&&module.exports)module.exports=model;
  else root.SalaryModel=model;
})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const defaults=Object.freeze({monthlySalary:5000,start:'09:00',end:'18:00',lunchHours:2,workDays:22,backgroundColor:'#ffffff',backgroundImage:'',textColor:'#444444',transparent:false,privateDisplay:false});
  function timeMinutes(value){if(!/^\d{2}:\d{2}$/.test(value))return NaN;const [h,m]=value.split(':').map(Number);return h<24&&m<60?h*60+m:NaN;}
  function analyze(config){
    const salary=Number(config.monthlySalary),days=Number(config.workDays),lunch=Number(config.lunchHours),start=timeMinutes(config.start),end=timeMinutes(config.end);
    if(!Number.isFinite(salary)||salary<0||salary>100000000)return {error:'每月薪资须为 0 至 100,000,000 之间的数字'};
    if(!Number.isFinite(days)||days<1||days>31)return {error:'每月上班天数须为 1 至 31 天'};
    if(!Number.isFinite(start)||!Number.isFinite(end)||start===end)return {error:'请填写有效的上下班时间，且两个时间不能相同'};
    const shiftMinutes=(end-start+1440)%1440;
    if(!Number.isFinite(lunch)||lunch<0||lunch*60>=shiftMinutes)return {error:'午休须大于或等于 0，且小于班次总时长'};
    const hours=shiftMinutes/60-lunch,daily=salary/days,hourly=daily/hours;
    return {salary,days,lunch,start,end,shiftMinutes,hours,yearly:salary*12,daily,hourly,perMinute:hourly/60,perSecond:hourly/3600,overnight:end<start};
  }
  function progress(config,date=new Date()){
    const result=analyze(config);if(result.error)return result;
    const now=new Date(date),shiftStart=new Date(now);shiftStart.setHours(Math.floor(result.start/60),result.start%60,0,0);
    if(result.overnight&&now<shiftStart)shiftStart.setDate(shiftStart.getDate()-1);
    const span=result.shiftMinutes*60000,elapsed=Math.max(0,Math.min(span,now-shiftStart));
    const rest=result.lunch*3600000,restStart=(span-rest)/2,restUsed=Math.max(0,Math.min(rest,elapsed-restStart));
    const seconds=Math.max(0,(elapsed-restUsed)/1000),fraction=Math.min(1,seconds/(result.hours*3600));
    const status=now<shiftStart?'未上班':now-shiftStart>=span?'已下班':elapsed>=restStart&&elapsed<restStart+rest?'午休中':'工作中';
    return {...result,earned:result.daily*fraction,fraction,seconds,status,shiftEnd:shiftStart.getTime()+span};
  }
  function countdown(config,date=new Date()){
    const result=progress(config,date);if(result.error)return result;
    const seconds=Math.max(0,Math.ceil((result.shiftEnd-new Date(date).getTime())/1000));
    const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),remainder=seconds%60;
    const pad=value=>String(value).padStart(2,'0');
    return {seconds,text:(hours?pad(hours)+':':'')+pad(minutes)+':'+pad(remainder),label:seconds?'距离下班':'已下班'};
  }
  return {defaults,analyze,progress,countdown};
});
