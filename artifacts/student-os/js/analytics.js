import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', () => {
  const tasks = ls.get('tasks', []);
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;

  // Chart: Task Completion
  const ctxTasks = document.getElementById('chart-tasks');
  if (ctxTasks) {
    new Chart(ctxTasks, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [completed, pending],
          backgroundColor: ['#10b981', '#6b5ef5'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Chart: Study Hours (Mock data)
  const ctxHours = document.getElementById('chart-study-hours');
  if (ctxHours) {
    new Chart(ctxHours, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Hours',
          data: [2, 3, 1.5, 4, 2, 5, 3],
          borderColor: '#6b5ef5',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
});