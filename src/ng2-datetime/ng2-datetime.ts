import {Component, Output, Input, EventEmitter, HostListener, OnInit} from 'angular2/core';
import {ControlValueAccessor, NgControl} from 'angular2/common';

@Component({
    selector: 'datetime',
    template: `
    <div class="form-inline">
        <div id="{{idDatePicker}}" class="input-group date">
            <input type="text" class="form-control"/>
            <div class="input-group-addon">
                <span class="glyphicon glyphicon-th"></span>
            </div>
        </div>
        <div class="input-group bootstrap-timepicker timepicker">
            <input id="{{idTimePicker}}" type="text" class="form-control input-small">
            <span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>
        </div>
    </div>
    `
})
export class NKDatetime implements ControlValueAccessor, OnInit {
    @Output()
    dateChange:EventEmitter<Date> = new EventEmitter();
    @Input('timepicker')
    timepickerOptions:any = {};
    @Input('datepicker')
    datepickerOptions:any = {};

    date:Date; // ngModel
    // instances
    datepicker:any;
    timepicker:any;

    private idDatePicker:string = uniqueId('q-datepicker_');
    private idTimePicker:string = uniqueId('q-timepicker_');

    @HostListener('dateChange', ['$event'])
    onChange = (_) => {
    };
    onTouched = () => {
    };

    writeValue(value:any):void {
        this.date = value;
        if (isDate(this.date)) {
            setTimeout(() => {
                this.updateModel(this.date);
            }, 0);
        }
    }

    ngOnInit() {
        setTimeout(() => {
            this.init();
        }, 0);
    }

    constructor(ngControl:NgControl) {
        ngControl.valueAccessor = this; // override valueAccessor
    }

    registerOnChange(fn:(_:any) => void):void {
        this.onChange = fn;
    }

    registerOnTouched(fn:() => void):void {
        this.onTouched = fn;
    }

    //////////////////////////////////

    private init() {
        if (!this.datepicker && this.datepickerOptions !== false) {
            this.datepicker = (<any>$('#' + this.idDatePicker)).datepicker(this.datepickerOptions);
            this.datepicker
                .on('changeDate', (e) => {
                    let newDate:Date = e.date;

                    if (isDate(this.date) && isDate(newDate)) {
                        // get hours/minutes
                        var h = this.date.getHours();
                        var m = this.date.getMinutes();
                        newDate.setHours(h);
                        newDate.setMinutes(m);
                    }

                    this.date = newDate;
                    this.dateChange.emit(newDate);
                });
        } else if (this.datepickerOptions === false) {
            (<any>$('#' + this.idDatePicker)).remove();
        }

        if (!this.timepicker && this.timepickerOptions !== false) {
            let options = jQuery.extend({defaultTime: false}, this.timepickerOptions);
            this.timepicker = (<any>$('#' + this.idTimePicker)).timepicker(options);
            this.timepicker
                .on('changeTime.timepicker', (e) => {
                    let meridian = e.time.meridian;
                    let hours = e.time.hours;
                    if (meridian) {
                        // has meridian -> convert 12 to 24h
                        if (meridian === 'PM' && hours < 12) {
                            hours = hours + 12;
                        }
                        if (meridian === 'AM' && hours === 12) {
                            hours = hours - 12;
                        }
                        hours = this.pad(hours);
                    }
                    if (!isDate(this.date)) {
                        this.date = new Date();

                        if (this.datepicker !== undefined) {
                            this.datepicker.datepicker('update', this.date.toLocaleDateString('en-US'));
                        }
                    }
                    this.date.setHours(parseInt(hours));
                    this.date.setMinutes(e.time.minutes);
                    this.dateChange.emit(this.date);
                });
        } else if (this.timepickerOptions === false) {
            (<any>$('#' + this.idTimePicker)).parent().remove();
        }
    }

    private updateModel(date?:Date) {
        // update date
        if (this.datepicker !== undefined) {
            this.datepicker.datepicker('update', date.toLocaleDateString('en-US'));
        }

        // update time
        if (this.timepicker !== undefined) {
            let hours = this.date.getHours();
            if (this.timepickerOptions.showMeridian) {
                // Convert 24 to 12 hour system
                hours = (hours === 0 || hours === 12) ? 12 : hours % 12;
            }
            let meridian = this.date.getHours() >= 12 ? ' PM' : ' AM';

            this.timepicker.timepicker('setTime', this.pad(hours) + ':' + this.date.getMinutes() + meridian);
        }
    }

    private pad(value:any) {
        return (value && value.toString().length < 2) ? '0' + value : value.toString();
    }
}

let id:number = 0;
function uniqueId(prefix:string):string {
    return prefix + ++id;
}

function isDate(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}