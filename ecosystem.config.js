module.exports = {
  apps :[
    {
      name:'Cluster App',
      script:'app.js',
      instances:2,
      autorestart:true,
      exec_mode:"cluster",
      watch:true,
      max_memory_restart:'1G'
    },
    {
      name:'Worker',
      instance:1,
      script:'worker/worker.js'
    }
  ],
};
