import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {
  BedService,
  IFloor,
  IRoom,
  IRoomType,
  LoadingService,
  RoomService,
} from 'src/app/core';
import { AddBedComponent } from '../../bed/add-bed/add-bed.component';
import { EditBedComponent } from '../../bed/edit-bed/edit-bed.component';
import { InfoComponent } from '../../bed/info/info.component';
import { BuildingShare } from '../../building-share.service';
import { AddRoomComponent } from '../add-room/add-room.component';
import { EditRoomComponent } from '../edit-room/edit-room.component';

@Component({
  selector: 'app-list-room',
  templateUrl: './list-room.component.html',
  styleUrls: ['./list-room.component.css'],
})
export class ListRoomComponent implements OnInit {
  rooms: IRoom[] = [];
  floors: IFloor[] = [];
  selectControl = new FormControl();
  room: IRoom = {} as IRoom;
  roomTypes: IRoomType[] = [];
  // buildings: Building

  displayedColumns: string[] = ['id', 'name', 'contract', 'action'];

  @Input('inputFloors') set setFloors(value: IFloor[]) {
    this.floors = value;
    this.selectControl.patchValue(value[0]?.id);
    this.getRooms('reload');
  }
  @Input('roomTypes') set setRoomTypes(value: IRoomType[]) {
    this.roomTypes = value;
  }

  constructor(
    public dialog: MatDialog,
    private roomService: RoomService,
    private buildingShare: BuildingShare,
    private bedService: BedService,
    public toast: ToastrService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {}

  changeFloor() {
    this.loadingService.setLoading(true);
    this.getRooms('reload');
  }

  getRooms(check: string) {
    if (check == 'reload') {
      this.roomService.getAll({ floor_id: this.selectControl.value }).subscribe(
        (t) => {
          this.rooms = t.data;
          this.loadingService.setLoading(false);
        },
        (f) => {
          this.loadingService.setLoading(false);
        }
      );
    }
  }

  roomAddDialog(floor_id: any): void {
    if (this.roomTypes?.length > 0) {
      const dialogRef = this.dialog.open(AddRoomComponent, {
        width: '640px',
        disableClose: false,
        data: { floor_id: floor_id, roomTypes: this.roomTypes },
      });
      dialogRef.afterClosed().subscribe((value) => this.getRooms(value));
    } else {
      this.toast.error(
        'Ch??a c?? lo???i ph??ng, h??y th??m lo???i ph??ng cho d??? ??n.',
        'Th??ng b??o',
        {
          timeOut: 4000,
          closeButton: true,
        }
      );
    }
  }

  roomDetailDialog(room: any): void {
    const dialogRef = this.dialog.open(InfoComponent, {
      width: '700px',
      height: '300px',
      disableClose: false,
      data: { room: room },
    });
  }

  roomEditDialog(room: IRoom): void {
    if (this.roomTypes?.length > 0) {
      const dialogRef = this.dialog.open(EditRoomComponent, {
        width: '640px',
        disableClose: false,
        data: { room: room, roomTypes: this.roomTypes },
      });
      dialogRef.afterClosed().subscribe((value) => this.getRooms(value));
    } else {
      this.toast.error(
        'Ch??a c?? lo???i ph??ng, h??y th??m lo???i ph??ng cho d??? ??n.',
        'Th??ng b??o',
        {
          timeOut: 4000,
          closeButton: true,
        }
      );
    }
  }

  editBed(bed: any) {
    const dialogRef = this.dialog.open(EditBedComponent, {
      width: '640px',
      minHeight: '150px',
      disableClose: false,
      data: { bed: bed, floor_id: this.selectControl.value },
    });
    dialogRef.afterClosed().subscribe((value) => this.getRooms(value));
  }

  addBed(room: any) {
    if (room?.beds?.length > room?.room_type?.number_bed) {
      this.toast.error(
        `T???i ??a ${room?.room_type?.number_bed} gi?????ng,th???a ${
          room?.beds?.length - room?.room_type?.number_bed
        } gi?????ng, h??y x??a gi?????ng ch??a c?? ng?????i thu??.`,
        'Th??ng b??o',
        {
          timeOut: 4000,
          closeButton: true,
        }
      );
    } else if (room?.beds?.length == room?.room_type?.number_bed) {
      this.toast.error(
        `Ph??ng ???? ????? ${room?.beds?.length} gi?????ng, kh??ng ???????c t???o th??m`,
        'Th??ng b??o',
        {
          timeOut: 3000,
          closeButton: true,
        }
      );
    } else {
      const dialogRef = this.dialog.open(AddBedComponent, {
        width: '500px',
        minHeight: '150px',
        disableClose: false,
        data: { room_id: room.id, floor_id: this.selectControl.value },
      });
      dialogRef.afterClosed().subscribe((value) => this.getRooms(value));
    }
  }

  removeBed(bed: any) {
    if (bed.contract) {
      this.toast.error('Gi?????ng n??y ??ang d??ng, kh??ng ???????c x??a', 'Th??ng b??o', {
        timeOut: 3000,
        closeButton: true,
      });
    } else {
      if (window.confirm('X??c nh???n x??a?')) {
        this.loadingService.setLoading(true);
        this.bedService.delete(bed?.id).subscribe(
          (t) => {
            this.getRooms('reload');
            this.toast.success('X??a gi?????ng th??nh c??ng', 'Th??ng b??o', {
              timeOut: 3000,
              closeButton: true,
            });
          },
          (f) => {
            this.loadingService.setLoading(false);
            this.toast.error('X??a gi?????ng th???t b???i', 'Th??ng b??o', {
              timeOut: 3000,
              closeButton: true,
            });
          }
        );
      }
    }
  }

  isHaveContractInRoom(room: any) {
    let result = room?.beds.filter((b: any) => b?.contract !== null);
    return result.length > 0 ? true : false;
  }

  removeRoom(room: any) {
    if (window.confirm('X??c nh???n x??a ph??ng?')) {
      if (!this.isHaveContractInRoom(room)) {
        this.loadingService.setLoading(true);
        this.roomService.delete(room?.id).subscribe(
          (t) => {
            this.toast.success('X??a ph??ng th??nh c??ng', 'Th??ng b??o', {
              timeOut: 3000,
              closeButton: true,
            });
            this.getRooms('reload');
          },
          (f) => {
            this.loadingService.setLoading(false);
            this.toast.error('X??a ph??ng th???t b???i', 'Th??ng b??o', {
              timeOut: 3000,
              closeButton: true,
            });
          }
        );
      } else {
        this.toast.error(
          'Ph??ng c?? h???p ?????ng, kh??ng th??? x??a c??? ph??ng',
          'Th??ng b??o',
          {
            timeOut: 3000,
            closeButton: true,
          }
        );
      }
    }
  }
}
