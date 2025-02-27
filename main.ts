
namespace DateTimeData {

    let kindid: number;

    export function create() {
        if (!(kindid)) kindid = 0
        return kindid++
    }

    //%isKind
    export const mainDateTime = create()

}

namespace DateTime {
    
    export class dates { constructor(public month:number,public day:number,public year:number) {} }

    export class times { constructor(public hour:number,public minute:number,public second:number) {} }

    //% shim=KIND_GET
    //% blockHidden=true
    //% kindMemberName=Datetime
    //% blockId=datetime_kind
    //% block="$arg"
    //% kindNamespace=DateTimeData
    //% kindPromptHint="enter your datetime here"
    export function _datetimekindshadow(arg: number) { return arg }

    //% blockHidden=true
    //% blockId=datetime_dateshadow
    //% block="month $month / day $day / year $year"
    //% month.min=1 month.max=12 month.defl=1
    //% day.min=1 day.max=31 day.defl=20
    //% year.min=2020 year.max=2050 year.defl=2022
    export function datevalue(month:number,day:number,year:number) { return new dates(month,day,year) }

    //% blockHidden=true
    //% blockId=datetime_timeshadow
    //% block="$hour : $min . $sec"
    //% hour.min=0 hour.max=23 hour.defl=13
    //% min.min=0 min.max=59 min.defl=30
    //% sec.min=0 sec.max=59 sec.defl=0
    export function time24value(hour: number, min: number, sec: number) { return new times(hour,min,sec) }

    //% blockHidden=true
    //% blockId=datetime_halftimeshadow
    //% block="$hour : $min . $sec"
    //% hour.min=1 hour.max=12 hour.defl=11
    //% min.min=0 min.max=59 min.defl=30
    //% sec.min=0 sec.max=59 sec.defl=0
    export function time12value(hour: number, min: number, sec: number) { return new times(hour,min,sec) }


}

/**
 * Provides a software based running clock for the time and date for the arcade. 
 * The makecode arcade doesn't have a true real-time clock. The arcade uses a timer derived from the
 * 16MHz clock, which is crystal based and should have an accuracy near 10 part per million, 
 * or about 0.864 seconds/day.
 *
 * @author Bill Siever
 */
//% block="Time and Date"
//% color="#AA278D"  icon="\uf017"
namespace DateTime {

    let dtdata: DateTime[] = [], dtid: number[] = [], curid = 0
    dtid.push(0), dtdata.push({ month: 0, year: 0, day: 0, hour: 0, minute: 0, second: 0, dayOfYear: 0 })

    function checkid(id: number) {
        if (id < 0) return 0
        let uid = id + 1
        if (dtid.indexOf(uid) < 0) {
            curid++
            dtid.push(curid)
            dtdata.push({ month: 0, year: 0, day: 0, hour: 0, minute: 0, second: 0, dayOfYear: 0 })
            return dtid.length - 1
        }
        return dtid.indexOf(uid)
    }

    /* 
        This ensures that "time" is checked periodically and event handlers are called.  
    */
    game.onUpdateInterval(864, function() {
        // Only run about every 2 s;  Micro:bit uses a ticker with a 32kHz period, so the count should increase by about 65kHz for arcade or etc.
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, DateTimeData.mainDateTime)
        if (lastUpdateMinute != t.minute) {
            // New minute
            control.raiseEvent(TIME_AND_DATE_EVENT, TIME_AND_DATE_NEWMINUTE)
            lastUpdateMinute = t.minute
        }
        if (lastUpdateHour != t.hour) {
            // New hour
            control.raiseEvent(TIME_AND_DATE_EVENT, TIME_AND_DATE_NEWHOUR)
            lastUpdateHour = t.hour
        }
        if (lastUpdateDay != t.day) {
            // New day
            control.raiseEvent(TIME_AND_DATE_EVENT, TIME_AND_DATE_NEWDAY)
            lastUpdateDay = t.day
        }
    })


    // ********* Enumerations for parameter types ************************
    
    let monthName: string[][] = [
        ["1","2","3","4","5","6","7","8","9","10","11","12"],
        ["January","Febuary","March","April","May","June","July","Orgust","September","October","November","December"]
        ]

    let weekName: string[][] = [
        ["0","1","2","3","4","5","6"],
        ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        ]

    export enum YearFormat {
        //% block="national year"
        NY = 0,
        //% block="buddhist year"
        BHY = 543,
    }
    
    export enum MornNight {
        //% block="am"
        AM,
        //% block="pm"
        PM
    }

    export enum TimeUnit {
        //% block="ms"
        Milliseconds,
        //% block="seconds"
        Seconds,
        //% block="minutes"
        Minutes,
        //% block="hours"
        Hours,
        //% block="days"
        Days
    }

    export enum TimeFormat {
        //% block="h:mm.ss am / pm"
        HMMSSAMPM,
        //% block="hh:mm 24-hr"
        HHMM24hr,
        //% block="hh:mm.ss 24-hr"
        HHMMSS24hr,
        //% block="h:mm"
        HMM,
        //% block="h:mm am / pm"
        HMMAMPM,
    }

    export enum DateFormat {
        //% block=day/subweekname/submonthname"
        DWnsMns,
        //% block="day/weekname/monthname"
        DWnMn,
        //% block="month/day"
        MD,
        //% block="month/day/year"
        MDY,
        //% block="year-month-day"
        YYYY_MM_DD
    }

    export enum MonthNameFormat {
        //% block="Fullname"
        Fname,
        //% block="Subname"
        Sname,
    }

    export enum WeekNameFormat {
        //% block="Fullname"
        Fname,
        //% block="3Subname"
        S3name,
        //% block="2Subname"
        S2name,
    }

    type Month = uint8   // 1-12 Month of year
    type Day = uint8     // 1-31 / Day of month
    type Year = uint16 // Assumed to be 0000-0099 or 2020-2099  
    type Hour = uint8  // 0-23 / 24-hour format  
    type Minute = uint8 // 0-59 
    type Second = uint8 // 0-59
    type DayOfYear = uint16 // 1-366

    type SecondsCount = uint32 // Seconds since start of start year
    type Weekday = uint8 // Weekday code. 0=Sunday, 1=Monday, etc.

    interface DateTime {
        month: Month   // 1-12 Month of year
        day: Day   // 1-31 / Day of month
        year: Year  // Assumed to be 2020 or later
        hour: Hour   // 0-23 / 24-hour format  
        minute: Minute   // 0-59 
        second: Second   // 0-59
        dayOfYear: DayOfYear  // 1-366
    }

    interface MonthDay {
        month: Month   // 1-12 Month of year
        day: Day   // 1-31 / Day of month
    }

    // ********* State Variables ************************

    const TIME_AND_DATE_EVENT = 94
    const TIME_AND_DATE_NEWMINUTE = 1
    const TIME_AND_DATE_NEWHOUR = 2
    const TIME_AND_DATE_NEWDAY = 3

    // State variables to manage time 
    let startYear: Year = 0
    let timeToSetpoint: SecondsCount = 0
    let cpuTimeAtSetpoint: SecondsCount = 0

    /*    
    Time is all relative to the "start year" that is set by setDate() (or 0 by default) as follows:

      Start year          Time Date/Time set        CurrentCPUTime
      |                   | (in s)                  | (in s)
      V                   V                         V
      |-------------------+-------------------------|
                          ^
                          |
                          Known dd/mm/yy hh:mm,.s
                          AND cpuTimeAtSetpoint (in s)
       |------------------|-------------------------|
          timeToSetpoint          deltaTime
          (in s)                  ( in s)
    
        setDate sets the startYear and updates timeToSetpoint and cpuTimeAtSetpoint 
        setTime methods update just timeToSetpoint and cpuTimeAtSetpoint
     */

    // State for event handlers 
    let lastUpdateMinute: Minute = 100   // Set to invalid values for first update
    let lastUpdateHour: Hour = 100
    let lastUpdateDay: Day = 100


    // Cummulative Days of Year (cdoy): Table of month (1-based indices) to cummulative completed days prior to month
    // Ex: By Feb 1st (2nd month / index 2), 31 days of Jan are completed. 
    const cdoy: DayOfYear[] = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365]

    // ********* Time Calculation / Management ************************


    function isLeapYear(y: Year): boolean {
        // The /400 and /100 rules don't come into play until 2400 and 2300 or 0100.  We can ignore them here
        // Here's the code for accurate handling of leap years:
        return (y % 400 == 0 || (y % 100 != 0 && y % 4 == 0))

        // Simplified case for 2020-2099.
        // return y % 4 == 0
    }


    // Returns a MonthDay with from a DayOfYear and given Year
    function dayOfYearToMonthAndDay(d: DayOfYear, y: Year): MonthDay {
        // If it's after Feb in a leap year, adjust
        if (isLeapYear(y)) {
            if (d == 60) {  // Leap Day!
                return { month: 2, day: 29 }
            } else if (d > 60) {
                d -= 1  // Adjust for leap day
            }
        }
        for (let i = 1; i < cdoy.length; i++) {  // Start at 1 for 1- based index
            // If the day lands in (not through) this month, return it
            if (d <= cdoy[i + 1]) {
                return { month: i, day: d - cdoy[i] }

            }
        }
        // This should never happen!
        return { month: -1, day: -1 }
    }

    function secondsSoFarForYear(m: Month, d: Day, y: Year, hh: Hour, mm: Minute, ss: Second): SecondsCount {
        // ((((Complete Days * 24hrs/ day)+complete hours)*60min/ hr)+complete minutes)* 60s/ min + complete seconds
        // Yay Horner's Rule!:
        return (((dateToDayOfYear(datevalue(m, d, y)) - 1) * 24 + hh) * 60 + mm) * 60 + ss
    }

    function timeFor(cpuTime: SecondsCount, kindid: number = null, uval: boolean=false): DateTime {
        const deltaTime = cpuTime - cpuTimeAtSetpoint
        let sSinceStartOfYear = timeToSetpoint + deltaTime
        // Find elapsed years by counting up from start year and subtracting off complete years
        let y = startYear
        let leap = isLeapYear(y)
        while ((!leap && sSinceStartOfYear > 365 * 24 * 60 * 60) || (sSinceStartOfYear > 366 * 24 * 60 * 60)) {
            if (leap) {
                sSinceStartOfYear -= 366 * 24 * 60 * 60
            } else {
                sSinceStartOfYear -= 365 * 24 * 60 * 60
            }
            y += 1
            leap = isLeapYear(y)
        }

        // sSinceStartOfYear and leap are now for "y", not "year".  Don't use "year"! Use "y"
        // Find elapsed days
        const daysFromStartOfYear = Math.idiv(sSinceStartOfYear, (24 * 60 * 60)) + 1  // +1 offset for 1/1 being day 1
        const secondsSinceStartOfDay = sSinceStartOfYear % (24 * 60 * 60)

        // Find elapsed hours
        const hoursFromStartOfDay = Math.idiv(secondsSinceStartOfDay, (60 * 60))
        const secondsSinceStartOfHour = secondsSinceStartOfDay % (60 * 60)

        // Find elapsed minutes
        const minutesFromStartOfHour = Math.idiv(secondsSinceStartOfHour, (60))
        // Find elapsed seconds
        const secondsSinceStartOfMinute = secondsSinceStartOfHour % (60)

        // Convert days to dd/ mm
        const ddmm = dayOfYearToMonthAndDay(daysFromStartOfYear, y) // current year, y, not start year
        
        let kdid = DateTimeData.mainDateTime 
        if (kindid)
            kdid = checkid(kindid)
        else
            kdid = checkid(-1)
        
        if (uval) return { month: ddmm.month, day: ddmm.day, year: y, hour: hoursFromStartOfDay, minute: minutesFromStartOfHour, second: secondsSinceStartOfMinute, dayOfYear: daysFromStartOfYear }
        dtdata[kdid] = { month: ddmm.month, day: ddmm.day, year: y, hour: hoursFromStartOfDay, minute: minutesFromStartOfHour, second: secondsSinceStartOfMinute, dayOfYear: daysFromStartOfYear }
        return dtdata[kdid]
    }

    //% shim=timeanddate::cpuTimeInSeconds
    function cpuTimeInSeconds(): uint32 {
        return Math.idiv(game.runtime(), 1000)
    }

    // ********* Misc. Utility Functions for formatting ************************
    function leftZeroPadTo(inp: number, digits: number) {
        let value = inp + ""
        while (value.length < digits) {
            value = "0" + value
        }
        return value
    }


    // 24-hour time:  hh:mm.ss
    function fullTime(t: DateTime): string {
        return leftZeroPadTo(t.hour, 2) + ":" + leftZeroPadTo(t.minute, 2) + "." + leftZeroPadTo(t.second, 2)
    }

    // Full year: yyyy-mm-dd
    function fullYear(t: DateTime, y: YearFormat=0): string {
        return leftZeroPadTo(t.year + y, 4) + "-" + leftZeroPadTo(t.month, 2) + "-" + leftZeroPadTo(t.day, 2)
    }


    // ********* Exposed blocks ************************


    /**
     * Set the time using 24-hour format. 
     * @param hour the hour (0-23)
     * @param minute the minute (0-59)
     * @param second the second (0-59)
     */
    //% blockid=datetime_set24hrtime
    //% block="set time from 24-hour time $times|| to datetime kind $kindn"
    //% times.shadow=datetime_timeshadow
    //% kindn.shadow=datetime_kind
    //% weight=90
    export function set24HourTime(times: times, kindn: number = null, uval: boolean = false) {
        let hour = times.hour, minute = times.minute, second = times.second
        hour = hour % 24
        minute = minute % 60
        second = second % 60
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, kindn, uval)
        cpuTimeAtSetpoint = cpuTime
        timeToSetpoint = secondsSoFarForYear(t.month, t.day, t.year, hour, minute, second)
    }

    /**
     * Set the date
     * @param month the month 1-12
     * @param day the day of the month 1-31
     * @param the year 2020-2050
     */
    //% blockid=datetime_setdate
    //% block="set date to $dates|| to datetime kind $kindn"
    //% kindn.shadow=datetime_kind
    //% month.min=1 month.max=12 month.defl=1
    //% day.min=1 day.max=31 day.defl=20
    //% year.min=2020 year.max=2050 year.defl=2022
    //% dates.shadow=datetime_dateshadow
    //% weight=80
    export function setDate(dates: dates, kindn: number = null, uval: boolean = false) {
        let year = dates.year, month = dates.month, day = dates.day
        month = month % 13
        day = day % 32
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, kindn, uval)
        startYear = year
        cpuTimeAtSetpoint = cpuTime
        timeToSetpoint = secondsSoFarForYear(month, day, startYear, t.hour, t.minute, t.second)
    }

    /**
     * Set the time using am/pm format
     * @param hour the hour (1-12)
     * @param minute the minute (0-59)
     * @param second the second (0-59)
     * @param ampm morning or night
     */
    //% block=datetime_settime
    //% block="set time to $times $ampm|| to datetime kind $kindn"
    //% hour.min=1 hour.max=12 hour.defl=11
    //% minute.min=0 minute.max=59 minute.defl=30
    //% second.min=0 second.max=59 second.defl=0
    //% kindn.shadow=datetime_kind
    //% times.shadow=datetime_halftimeshadow
    //% inlineInputMode=inline
    //% weight=100
    export function set12HourTime(times: times, ampm: MornNight, kindn: number = null, uval: boolean = false) {
        let hour = times.hour, minute = times.minute, second = times.second
        hour = (hour-1 % 12)+1
        // Adjust to 24-hour time format
        if (ampm == MornNight.AM && hour == 12) {  // 12am -> 0 hundred hours
            hour = 0;
        } else if (ampm == MornNight.PM && hour != 12) {   // PMs other than 12 get shifted after 12:00 hours
            hour = hour + 12;
        }
        set24HourTime(time24value(hour,minute,second), kindn, uval);
    }

    /**
     * Advance the time by the given amount, which cause "carries" into other aspects of time/date.  Negative values will cause time to go back by the amount.
     * @param amount the amount of time to add (or subtract if negative).  To avoid "carries" use withTime blocks
     * @param unit the unit of time
     */
    //% blockid=datetime_advancesetdatetime
    //% block="advance time/date by $amount $unit" advanced=true
    //% weight=50
    export function advanceBy(amount: number, unit: TimeUnit) {
        const units = [0, 1, 60 * 1, 60 * 60 * 1, 24 * 60 * 60 * 1]
        // Don't let time go negative:
        if (amount < 0 && (-amount * units[unit]) > timeToSetpoint)
            timeToSetpoint = 0
        else
            timeToSetpoint += amount * units[unit]
    }


    /**
     * Get the Day of the week  
     *  0=>Monday, 1=>Tuesday, etc.
     */
    //% blockid=datetime_date2dayweek
    //% block="day of week for $dates" advanced=true
    //% dates.shadow=datetime_dateshadow
    //% weight=40
    export function dateToDayOfWeek(dates: dates): Weekday {
        let month = dates.month, day = dates.day, year = dates.year
        let doy = dateToDayOfYear(datevalue(month, day, year))
        // Gauss's Algorithm for Jan 1: https://en.wikipedia.org/wiki/Determination_of_the_day_of_the_week
        // R(1+5R(A-1,4)+4R(A-1,100)+6R(A-1,400),7)    
        let jan1 = ((1 + 5 * ((year - 1) % 4) + 4 * ((year - 1) % 100) + 6 * ((year - 1) % 400)) % 7)
        jan1 += 6  // Shift range:  Gauss used 0=Sunday, we'll use 0=Monday
        return ((doy - 1) + jan1) % 7
    }

    /**
     * Get the Day of the year  
     *  Jan 1 = 1, Jan 2=2, Dec 31 is 365 or 366
     */
    //% blockid=datetime_date2dayyear
    //% block="day of year for $dates" advanced=true
    //% dates.shadow=datetime_dateshadow
    //% weight=30
    export function dateToDayOfYear(dates: dates): DayOfYear {
        let year = dates.year, month = dates.month, day = dates.day
        month = Math.constrain(month, 1, 12)
        // Assumes a valid date
        let dayOfYear = cdoy[month] + day
        // Handle after Feb in leap years:
        if (month > 2 && isLeapYear(year)) {
            dayOfYear += 1
        }
        return dayOfYear
    }

    /**
     * Get all values of time as numbers.  
     */
    //% blockid=datetime_alldatetimetogetinstatement
    //% block="time as numbers $hour:$minute.$second on $month/$day/$year || from datetime kind $kindn" advanced=true
    //% kindn.shadow=datetime_kind
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=100
    export function numericTime(handler: (hour: Hour, minute: Minute, second: Second, month: Month, day: Day, year: Year) => void, kindn: number=null) {
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, kindn)
        handler(t.hour, t.minute, t.second, t.month, t.day, t.year)
    }

    /**
     * Current time as a string in the format
     * @param format the format to use
     */
    //% blockid=datetime_time2format
    //% block="time as $format|| from datetime kind $kindn"
    //% kindn.shadow=datetime_kind
    //% weight=70
    export function time(format: TimeFormat, kindn: number = null, uval: boolean = false): string {
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, kindn, uval)

        // Handle 24-hour format with helper
        if (format == TimeFormat.HHMMSS24hr)
            return fullTime(t)

        // Format minutes for all remaining formats
        let minute = leftZeroPadTo(t.minute, 2)

        // Simpler military format
        if (format == TimeFormat.HHMM24hr)
            return leftZeroPadTo(t.hour, 2) + ":" + minute

        // Data for all other formats
        // Compute strings for other formats
        let hour = null
        let ap = t.hour < 12 ? "am" : "pm"
        if (t.hour == 0) {
            hour = "12:"  // am
        } else if (t.hour > 12) {
            hour = (t.hour - 12) + ":"
        } else {
            hour = (t.hour) + ":"
        }

        // Compose them appropriately
        switch (format) {
            case TimeFormat.HMMSSAMPM:
                return hour + minute + "." + leftZeroPadTo(t.second, 2) + ap

            case TimeFormat.HMMAMPM:
                return hour + minute + ap

            case TimeFormat.HMM:
                return hour + minute
        }
        return ""
    }

    /**
     * Current date month name as a string in the format name
     * @param format the format to use
     */
    //% blockid=datetime_datemonth2format 
    //% block="month name as $format|| from datetime kind $kindn"
    //% kindn.shadow=datetime_kind
    //% weight=20
    export function nameMonth(format: MonthNameFormat, kindn: number = null, uval: boolean = false): string {
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime,kindn,uval)
        const dtIdx = monthName[0].indexOf(t.month.toString())
        const dtName = monthName[1][dtIdx]
        switch (format) {
            case MonthNameFormat.Fname:
                return dtName
                break
            case MonthNameFormat.Sname:
                return dtName.substr(0,3)
                break
        }
        return ""
    }

    /**
     * Current date week name as a string in the format name
     * @param format the format to use
     */
    //% blockid=datetime_dateweek2format
    //% block="week name as $format|| from datetime kind $kindn"
    //% kindn.shadow=datetime_kind
    //% weight=20
    export function nameWeek(format: WeekNameFormat, kindn: number = null, uval: boolean = false): string {
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime,kindn,uval)
        const w = dateToDayOfWeek(datevalue(t.month, t.day, t.year))
        const dtIdx = weekName[0].indexOf(w.toString())
        const dtName = weekName[1][dtIdx]
        switch (format) {
            case WeekNameFormat.Fname:
                return dtName
                break
            case WeekNameFormat.S3name:
                return dtName.substr(0, 3)
                break
            case WeekNameFormat.S2name:
                return dtName.substr(0, 2)
                break
        }
        return ""
    }

    /**
     * Current date as a string in the format
     * @param format the format to use
     */
    //% blockid=datetime_date2format
    //% block="date as $format for year in $y|| from datetime kind $kindn"
    //% kindn.shadow=datetime_kind
    //% weight=60
    export function date(format: DateFormat, y: YearFormat=0, kindn: number = null, uval: boolean = false): string {
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, kindn, uval)
        const w = dateToDayOfWeek(datevalue(t.month, t.day, t.year))
        const dtIdx = [monthName[0].indexOf(t.month.toString()),weekName[0].indexOf(w.toString())]
        const dtName = [monthName[1][dtIdx[0]],weekName[1][dtIdx[1]]]
        switch (format) {
            case DateFormat.DWnsMns:
                return t.day + "/" + dtName[1].substr(0, 3).toUpperCase() + "/" + dtName[0].substr(0, 3).toUpperCase()
                break
            case DateFormat.DWnMn:
                return t.day + "/" + dtName[1] + "/" + dtName[0]
                break
            case DateFormat.MD:
                return t.month + "/" + t.day
                break
            case DateFormat.MDY:
                t.year += y
                return t.month + "/" + t.day + "/" + t.year
                break
            case DateFormat.YYYY_MM_DD:
                return fullYear(t,y)
                break

        }
        return ""
    }

    /**
     * Current date and time in a timestamp format (YYYY-MM-DD HH:MM.SS).  
     */
    //% blockid=datetime_dateandtime 
    //% block="date and time stamp for year in $y|| from datetime kind $kindn"
    //% kindn.shadow=datetime_kind
    //% weight=50
    export function dateTime(y: YearFormat=0, kindn: number = null, uval: boolean = false): string {
        const cpuTime = cpuTimeInSeconds()
        const t = timeFor(cpuTime, kindn, uval)
        return fullYear(t,y) + " " + fullTime(t)
    }

    /**
     * Seconds since start of arcade 
     */
    //% blockid=datetime_secsincestart
    //% block="seconds since arcade start" advanced=true
    //% weight=40
    export function secondsSinceReset(): number {
        return cpuTimeInSeconds()
    }


    /**
     * Called when minutes change
     */
    //% blockid=datetime_minuteupdate
    //% block="minute changed" advanced=true
    //% weight=85
    export function onMinuteChanged(handler: () => void) {
        control.onEvent(TIME_AND_DATE_EVENT, TIME_AND_DATE_NEWMINUTE, handler)
    }

    /**
     * Called when hours change
     */
    //% blockid=datetime_hourupdate
    //% block="hour changed" advanced=true
    //% weight=80
    export function onHourChanged(handler: () => void) {
        control.onEvent(TIME_AND_DATE_EVENT, TIME_AND_DATE_NEWHOUR, handler)
    }

    /**
     * Called when days change
     */
    //% blockid=datetime_dayupdate
    //% block="day changed" advanced=true
    //% weight=75
    export function onDayChanged(handler: () => void) {
        control.onEvent(TIME_AND_DATE_EVENT, TIME_AND_DATE_NEWDAY, handler)
    }

    // ***************** This was just for debugging / evaluate problems in API
    // Helpful for debugging / testing
    // /**
    //  * Seconds since start of year  
    //  */
    // //% block="seconds since year" advanced=true
    // export function secondsSinceYear(): number {
    //     const cpuTime = cpuTimeInSeconds()
    //     const t = timeFor(cpuTime)
    //     const deltaTime = cpuTime - cpuTimeAtSetpoint
    //     let sSinceStartOfYear = timeToSetpoint + deltaTime
    //     return sSinceStartOfYear
    // }

    // ********************************************************
}
