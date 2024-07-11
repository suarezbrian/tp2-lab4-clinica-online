import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { InformesService } from '../../services/informes.service';
import { Logs } from '../../interfaces/logs';
import { Turno } from '../../interfaces/turno';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [MatButtonModule, MatSelectModule, MatNativeDateModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, FormsModule, CommonModule, MatCardModule, MatIcon],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent {
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  fechaInicioEspecialista: Date | null = null;
  fechaFinEspecialista: Date | null = null;
  especialista: string = '';
  turnoPorEspecialista: string = '';
  especialistas: any[] = [];
  logsDelSistema: Logs[] = [];
  todosLosTurnos: Turno[] = [];
  turnosPorEspecialistaFinalizados: Turno[] =[];
  botonTurnosPorEspecialistaFinalizados: boolean = false;
  botonTurnosPorEspecialista: boolean = false;
  turnosPorEspecialista: Turno[] =[];
  turnosPorEspecialidad: any;
  private miGraficoTurnosFinalizados: Chart | undefined;
  private miGraficoTurnosPorEspecialista: Chart | undefined;

  data = [
    { key: 'Data1', value: 'Value1' },
    { key: 'Data2', value: 'Value2' },
    { key: 'Data3', value: 'Value3' }
  ];

  constructor(private informeServices:InformesService, private usuarioService:UsuarioService){}

  async ngOnInit() {

    this.informeServices.obtenerCollection('logs').subscribe({
      next: (logs: any[]) => {

        this.logsDelSistema = logs;
        const data = this.cantidadLogsPorDiasGrafico(this.logsDelSistema);
        Chart.register(...registerables);
        const ctx = document.getElementById('logsDiarios') as HTMLCanvasElement;
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: data,
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener especialidades:', error);
      }
    });


    this.informeServices.obtenerCollection('turnos').subscribe({
      next: (turnos: Turno[]) => {
        this.todosLosTurnos = turnos;
        this.turnosPorEspecialidad = this.agruparPorEspecialidad(this.todosLosTurnos);

        const dataPieChart = this.turnosPorEspecialidadGrafico(this.turnosPorEspecialidad);
        
        Chart.register(...registerables);
        const ctxPie = document.getElementById('turnosPorEspecialidad') as HTMLCanvasElement;
        const myPieChart = new Chart(ctxPie, {
          type: 'pie',
          data: dataPieChart,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem: any) => {
                    return `${tooltipItem.label}: ${tooltipItem.raw}`;
                  }
                }
              }
            }
          }
        });

          
      const dataBarChart = this.turnosTomadosPorDiasGrafico(this.todosLosTurnos);
      const ctxBar = document.getElementById('turnosPorDia') as HTMLCanvasElement;
      const myBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: dataBarChart,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de turnos por día'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Días de la semana'
              }
            }
          }
        }
      });
      },
      error: (error) => {
        console.error('Error al obtener turnos:', error);
      }
    }); 

    this.especialistas = await this.usuarioService.buscarVariosDatosPorCampo("usuarios", "rol", 2);

  }

  agruparPorEspecialidad(turnos: Turno[]): { [key: string]: Turno[] } {
    return turnos.reduce((agrupados: { [key: string]: Turno[] }, turno) => {
      const especialidad = turno.especialidad;
      if (!agrupados[especialidad]) {
        agrupados[especialidad] = [];
      }
      agrupados[especialidad].push(turno);
      return agrupados;
    }, {});
  }

  turnosTomadosPorDiasGrafico(turnos: Turno[]): any {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const turnosPorDia = [0, 0, 0, 0, 0, 0, 0]; 
  
    turnos.forEach(turno => {
      const fechaStr = turno.fecha.substring(1, turno.fecha.length - 1);
      const [diaStr, mesStr] = fechaStr.split('/').map(str => parseInt(str, 10));      
      const fecha = new Date(new Date().getFullYear(), mesStr - 1, diaStr); 
      const diaSemana = fecha.getDay();
      turnosPorDia[diaSemana-1]++;
    });
  
    return {
      labels: diasSemana,
      datasets: [{
        label: 'Cantidad de Turnos por Día',
        data: turnosPorDia,
        backgroundColor: 'rgba(54, 162, 235, 0.7)', 
        borderWidth: 1
      }]
    };
  }

  turnosPorEspecialidadGrafico(turnosPorEspecialidad: { [key: string]: Turno[] }): any {
    const labels = Object.keys(turnosPorEspecialidad);
    const data = labels.map(label => turnosPorEspecialidad[label].length);
    
    return {
      labels: labels,
      datasets: [{
        label: 'Cantidad de Turnos por Especialidad',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(233, 30, 99, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(0, 188, 212, 0.7)',
          'rgba(255, 235, 59, 0.7)',
        ],
        borderWidth: 1
      }]
    };
  }

  cantidadLogsPorDiasGrafico(logs: any[]) {

    const groupedByDay = logs.reduce((acc, log) => {
      const key = log.dia;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    }, {});

    const labels = Object.keys(groupedByDay);
    const data = {
      labels: labels,
      datasets: [{
        label: 'Ingresos al sistema por día',
        data: labels.map(label => groupedByDay[label]),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    return data;
  }


  async cargarTurnosFinalizadosPorEspecialista() {
    this.botonTurnosPorEspecialistaFinalizados = true;
    const fechaInicioStr = this.convertirFechaEnFormatoPermitido(this.fechaInicio);
    const fechaFinStr = this.convertirFechaEnFormatoPermitido(this.fechaFin);
    this.turnosPorEspecialistaFinalizados = await this.informeServices.obtenerTurnosFinalizadosPorEspecialista(fechaInicioStr, fechaFinStr, this.especialista);
    console.log( this.turnosPorEspecialistaFinalizados);
    const turnosPorFecha: { [fecha: string]: number } = {};
    this.turnosPorEspecialistaFinalizados.forEach(turno => {
        const fecha = turno.fecha; 
        if (!turnosPorFecha[fecha]) {
            turnosPorFecha[fecha] = 0;
        }
        turnosPorFecha[fecha]++;
    });

    const labels = Object.keys(turnosPorFecha);
    const data = Object.values(turnosPorFecha);

    this.generarTurnosFinalizadoGrafico(labels, data);
 }

 async cargarTurnosPorEspecialista() {
  this.botonTurnosPorEspecialista = true;
  const fechaInicioStr = this.convertirFechaEnFormatoPermitido(this.fechaInicioEspecialista);
  const fechaFinStr = this.convertirFechaEnFormatoPermitido(this.fechaFinEspecialista);
  this.turnosPorEspecialista = await this.informeServices.obtenerTurnosPorEspecialista(fechaInicioStr, fechaFinStr, this.turnoPorEspecialista);

  const turnosPorFecha: { [fecha: string]: number } = {};
  this.turnosPorEspecialista.forEach(turno => {
      const fecha = turno.fecha; 
      if (!turnosPorFecha[fecha]) {
          turnosPorFecha[fecha] = 0;
      }
      turnosPorFecha[fecha]++;
  });

  const labels = Object.keys(turnosPorFecha);
  const data = Object.values(turnosPorFecha);

  this.generarTurnosPorEspecialistaGrafico(labels, data);
}


 generarTurnosFinalizadoGrafico(labels: string[], data: number[]) {
    Chart.register(...registerables);
    const ctx = document.getElementById('turnosFinalizados') as HTMLCanvasElement;
    if (this.miGraficoTurnosFinalizados) {
      this.miGraficoTurnosFinalizados.destroy();
      this.miGraficoTurnosFinalizados = undefined;
    }

    ctx.getContext('2d')?.clearRect(0, 0, ctx.width, ctx.height);
    this.miGraficoTurnosFinalizados  = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Turnos Finalizados',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
 }

 generarTurnosPorEspecialistaGrafico(labels: string[], data: number[]) {
  Chart.register(...registerables);
  const ctx = document.getElementById('turnosPorEspecialista') as HTMLCanvasElement;

  if (this.miGraficoTurnosPorEspecialista) {
    this.miGraficoTurnosPorEspecialista.destroy();
    this.miGraficoTurnosPorEspecialista = undefined;
  }

  ctx.getContext('2d')?.clearRect(0, 0, ctx.width, ctx.height);
  this.miGraficoTurnosPorEspecialista  = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Cantidad de Turnos Por Especialista',
              data: data,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
}

  convertirFechaEnFormatoPermitido(date: Date | null): string {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `(${day}/${month})`;
  }

  exportToPDF(canvasId: string): void {
    const dataDiv: any = document.getElementById(canvasId);
  
    html2canvas(dataDiv).then(canvas => {
      
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      this.bordePDF(pdf);
  
      const logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Cruz_Roja.svg/1200px-Cruz_Roja.svg.png';
      pdf.addImage(logo, 'PNG', 10, 10, 50, 50);
      pdf.setFontSize(10);
      pdf.text(`Fecha emisión : ${new Date().toLocaleDateString()}`, 150, 10);
      pdf.setFontSize(25);
      pdf.text('Historia Clínica', 80, 60);
  
      pdf.setFontSize(18);
      pdf.text("Informe del Sistema", 85, 70);
    
  

      switch(canvasId){
        case "logsDiarios":
          this.logsDelSistemaInforme(pdf, canvas);
          break;
        case "turnosPorEspecialidad":
          this.turnosPorEspecialidadInforme(pdf, canvas);
          break;
        case "turnosFinalizados":
          this.turnosFinalizadoInforme(pdf, canvas);
          break;
        case "turnosPorEspecialista":
          this.turnosPorEspecialistaInforme(pdf, canvas);
          break;
      }
  
      pdf.save(`${canvasId}.pdf`);
    });
  }
  turnosPorEspecialistaInforme(pdf: any, canvas: any): void {
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 20, 80, 170, 150);
  
    pdf.addPage();
    this.bordePDF(pdf);
    
    pdf.setFontSize(18);
    pdf.text("Informe del Sistema - Turnos por Especialista", 50, 20);
  
    pdf.setFontSize(13);
    let yPos = 40;
    const pageHeight = pdf.internal.pageSize.height;

    pdf.text(`Desde: ${this.fechaInicioEspecialista ? this.fechaInicioEspecialista.toLocaleDateString() : 'N/A'}`, 10, yPos);
    yPos += 10;
    pdf.text(`Hasta: ${this.fechaFinEspecialista ? this.fechaFinEspecialista.toLocaleDateString() : 'N/A'}`, 10, yPos);
    yPos += 10;
    pdf.text(`Especialista Email: ${this.turnoPorEspecialista}`, 10, yPos);
    yPos += 20;
  
  }


  turnosFinalizadoInforme(pdf: any, canvas: any): void {
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 20, 80, 170, 150);
  
    pdf.addPage();
    this.bordePDF(pdf);
    
    pdf.setFontSize(18);
    pdf.text("Informe del Sistema - Turnos Finalizados", 50, 20);
  
    pdf.setFontSize(13);
    let yPos = 40;
    const pageHeight = pdf.internal.pageSize.height;
  
    pdf.text(`Desde: ${this.fechaInicio ? this.fechaInicio.toLocaleDateString() : 'N/A'}`, 10, yPos);
    yPos += 10;
    pdf.text(`Hasta: ${this.fechaFin ? this.fechaFin.toLocaleDateString() : 'N/A'}`, 10, yPos);
    yPos += 10;
    pdf.text(`Especialista Email: ${this.especialista}`, 10, yPos);
    yPos += 20;
  
    const cantidad = this.turnosPorEspecialistaFinalizados.length;
    pdf.text(`Cantidad de Turnos Finalizados: ${cantidad}`, 10, yPos);  

  }

  turnosPorEspecialidadInforme(pdf: any, canvas:any): void {
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 20, 80, 170, 150);

    pdf.addPage();
    this.bordePDF(pdf);
    
    pdf.setFontSize(18);
    pdf.text("Informe del Sistema - Turnos por Especialidad", 50, 20);
  
    pdf.setFontSize(13);
    let yPos = 40;
    const pageHeight = pdf.internal.pageSize.height;
  
    for (const especialidad in this.turnosPorEspecialidad) {
      if (this.turnosPorEspecialidad.hasOwnProperty(especialidad)) {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
          this.bordePDF(pdf);
        }
        const cantidad = this.turnosPorEspecialidad[especialidad].length;
        pdf.text(`Especialidad: ${especialidad}`, 10, yPos);
        yPos += 10;
        pdf.text(`Cantidad de Turnos: ${cantidad}`, 10, yPos);
        yPos += 10;
  
        pdf.setLineWidth(0.5);
        pdf.line(10, yPos, 200, yPos);
        yPos += 10;
      }
    }
  }

  logsDelSistemaInforme(pdf:any, canvas:any){
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 20, 80, 170, 130);

    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text("Informe del Sistema - Logs", 60, 20);

    pdf.setFontSize(13);
    let yPos = 40;
    const pageHeight = pdf.internal.pageSize.height;

    this.logsDelSistema.forEach(log => {
      this.bordePDF(pdf);
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = 20; 
        this.bordePDF(pdf);
      }
      pdf.text(`Usuario: ${log.usuario}`, 10, yPos);
      yPos += 10;
      pdf.text(`Dia: ${log.dia}`, 10, yPos);
      yPos += 10;
      pdf.text(`Horario: ${log.horario}`, 10, yPos);
      yPos += 10; 

     
      pdf.setLineWidth(0.5);
      pdf.line(10, yPos, 200, yPos);
      yPos += 10;
    });
  }

  bordePDF(pdf:any){
    pdf.setLineWidth(2);
    pdf.rect(2, 2, pdf.internal.pageSize.width - 5, pdf.internal.pageSize.height - 5);
  }
  
  
}
