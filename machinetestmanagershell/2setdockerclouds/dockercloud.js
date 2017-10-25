function caculate(formulation){
	var result = eval(formulation);
	WScript.Echo(formulation + " = " + result);
	return result;
}


var cloud = (function (){
  /*����ռ������Ϣ�Ǹ�����.*/  //��һ��Ĭ��Ϊ���ڵ��IP
  //�������д��ʽ{"IP":"172.16.2.133", "isMaster":true, "isPhysical": true, "MAC":"E0CB4EC8CF2E"}
  //�������������������д��ʽ{"IP":"172.16.2.95", "isMaster":false, "path":"D:\\wangqi\\src\\vm\\Kubernetes1\\Kubernetes.vmx"}
  var machines = [
    {"IP":"172.16.2.144", "isMaster":true, "isPhysical": true, "MAC":"60A44CAd55FB"},
    {"IP":"172.16.2.7", "isMaster":false, "isPhysical": true, "MAC":"E0CB4EC8CF2E"}
  ];  
  //ע�⣺�����hostname listҪ��machines�����е�IP˳���Ӧһ��
  //��һ��Ĭ��Ϊ���ڵ��������
  var hostnames = [
    {"hostname":"cloud1 cloud2"}
  ];
  
  //�������ù�����Ҫ�ı�������
  var machineName = [{
    "master_hostname":"cloud1",
	"KUBE_master_hostname":"cloud1",
	"registryHostname":"cloud2",
	"registryHostIP":"172.16.2.7",
	"apiserverHostname":"cloud1",
    "etcdHostname":"cloud1",
	"apiserver_host":"172.16.2.144",
	"kube_master_url":"172.16.2.144"
  }];
  //��������
  var pwd = "123456";

  
  //��machinesд�뵽������hosts�ļ���
  function localHOSTS(){
    var ForReading = 1, ForWriting = 2,ForAppending = 8;//ForAppending 8 ��ʾ���ļ������ļ�ĩβ��ʼд��
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var tmp      = fso.OpenTextFile("c:\\Windows\\System32\\drivers\\etc\\hosts", ForAppending, true);
    tmp.Write("\n" + dns2(machines));
    tmp.Close();
  }
  function dns2(machines){
    var d = [];
	var ss = hostnames[0].hostname;
	var hostname = ss.split(" ");
    for(var i=0; i<machines.length; i++) d.push(machines[i].IP + " " + hostname[i]);
    return d.join("\n");
  }

  
  //����дϵͳ��������ش���
  //�жϿ��ػ�
  function isRunning(machine){
    var shell = WScript.CreateObject("WScript.Shell");    
		var oExec = shell.Exec("ping -n 1 " + machine.IP);
		var input = oExec.StdOut.ReadAll();
		return input.match(/.*? \d+\.\d+\.\d+\.\d+.*=\d+.*?\d+ms TTL=\d+/i);
  }
  function show(machines, i){
	/* var temp = isRunning(machines[i])?"on ":"off";
	if(temp=="off"){
	  WScript.Echo("guanji"+temp);
	}else{
	  WScript.Echo("kaiji"+temp);
	} */
	
    WScript.Echo(
    (isRunning(machines[i])?"on ":"off") + " " + 
    (machines[i].isMaster?"master":"slave ") +  " " + 
    i + " " + machines.length + " " + machines[i].IP
    );
  }
  function shutdown(){
  
}

  //�ػ�����
  function halt(machine){
	/* 
	�õ��������enp3s0��centos7�У�����ֵ��ֵ��nic����
	nic=`ip a | grep  -o "^.: en[^:]*" | awk '{print $2}'`
	�鿴enp3s0�����շ���ͳ�ƣ�wol g�ǻ�������
	ethtool -s $nic wol g
	��ѯenp3s0���ڻ�������
	ethtool $nic
	#�˴�����ʱ����Ȼ�޷���wol�����Է��ּӲ��Ӷ����У�ԭ����cal.js���õĻ��Ǿɹػ����������Ǵ��µġ�
	#sleep 1
	�ػ�����poweroff�ǹػ���reboot������
	nohup poweroff >null 2>&1 &
	*/
	var shell = new ActiveXObject("WScript.Shell");
	//ע�������и�bug��֪Ϊɶ������ı�����Ϣ�������÷�����2�docker�Ƽ�Ⱥ.txt
	var oExec = shell.Exec("plink -batch -pw "+pwd+" root@"+machine.IP);
	//�ȵ����Զ��Ϳ���дָ���ˣ���ȻҪSleep
	//WScript.Sleep(1000);
	WScript.Echo("reading " + oExec.StdOut.Read(1));
	var input = oExec.StdIn.Write("nic=`ip a | grep  -o '^.: en[^:]*' | awk '{print $2}'` \r\n ethtool -s $nic wol g \r\n ethtool $nic \r\n nohup poweroff >null 2>&1 & \r\n");
	//�ȴ�ִ�н���
	WScript.Echo("reading " + oExec.StdOut.ReadAll());
    
  }
  function reboot(machine){
	var shell = new ActiveXObject("WScript.Shell");
	var oExec = shell.Exec("plink -batch -pw "+pwd+" root@"+machine.IP);
	//�ȵ����Զ��Ϳ���дָ���ˣ���ȻҪSleep
	//WScript.Sleep(1000);
	WScript.Echo("reading " + oExec.StdOut.Read(1));
	var input = oExec.StdIn.Write("nohup reboot >null 2>&1 & \r\nexit\r\n");
	//�ȴ�ִ�н���
	WScript.Echo("reading " + oExec.StdOut.ReadAll());
  }
  function start(machine){
    var shell = WScript.CreateObject("WScript.Shell");    
    if(machine.isPhysical){
      shell.run("wolcmd " +machine.MAC+ " 255.255.255.255 255.255.255.255 255", 1);    
    } 
	/* 
	�����������ı����ĵ����������������һ���ű���restartAllVirtualMachines��������Զ�̻����ϵ������
	else if(machine.path){
      shell.run(vmware + " -x " + machine.path, 1);
    } 
	*/
  }
  
  //��Ⱥ�ػ�
  function clusterOff(){
    for(var i=0; i<machines.length; i++){
      show(machines, i);
      if(isRunning(machines[i])) halt(machines[i]);
    }
    return machines.length;
  }
  //��Ⱥ����
  function clusterOn(){
    for(var i=0; i<machines.length; i++){
      show(machines, i);
      start(machines[i]);
    }
    return machines.length;
  }
  //��Ⱥ����
  function clusterReboot(){
    for(var i=0; i<machines.length; i++){
      show(machines, i);
      if(isRunning(machines[i])) reboot(machines[i]);
    }
    return machines.length;
  }
  //�鿴��Ⱥ������״̬
  function runningState(){
    for(var i=0; i<machines.length; i++){
      show(machines, i);
    }
    return machines.length;
  }
  
  function testcheshi1(){
	//runningState();
	//start_reset_stop_SomeVirtualMachines(flag,startNumber,endNumber)
	//clusterOff();
	//clusterOn();
	clusterReboot();
	//stopAllVirtualMachines();
  }

  //���û�������������IP��ַ��setupIPhostname.sh
  function setupIPhostname(){
	WScript.Echo("setupIPhostname");
	//ע�⣺����Ĭ�ϵ�yumԴ�����µģ����ﲻ����
	var ss = hostnames[0].hostname;
	var hostname = ss.split(" ");
	var iphostname = "";
	for(var a=0;a<hostname.length;a++){
		if(a==hostname.length-1){
			iphostname += machines[a].IP+" "+hostname[a]+"\"\n"
		}else{
			iphostname += machines[a].IP+" "+hostname[a]+"\n"
		}
	}
	for(var i =0;i<hostname.length;i++){
		//�ļ��滻
		var ForReading = 1, ForWriting = 2;
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var template = fso.OpenTextFile("setupIPhostname.sh", ForReading);
		var tmp      = fso.OpenTextFile("setupIPhostname.tmp"+i+".sh", ForWriting, true);
		var contentTemplate = template.ReadAll();
		tmp.Write(contentTemplate.replace(/hostname=\sIP_hostname=/g,"hostname="+hostname[i]+"\n"+"IP_hostname=\""+iphostname));
		template.Close();
		tmp     .Close();
		//���滻���ļ�ͨ��putty����Զ��ִ��
		var shell = WScript.CreateObject("WScript.Shell");
		//Ĭ��root�û�Ȩ��ֱ������
		shell.run("putty -m setupIPhostname.tmp"+i+".sh -pw " +pwd+ " root@" +machines[i].IP, 1, true);
	}  
  }
  
  //���ڵ���ӽڵ㹲ͬ������
  function common_init_MsaterSalve(){
    WScript.Echo("common_init_MsaterSalve");
	//ע�⣺����Ĭ�ϵ�yumԴ�����µģ����ﲻ����
	var ss = hostnames[0].hostname;
	var hostname = ss.split(" ");
	for(var i =0;i<hostname.length;i++){
		//�ļ��滻
		var ForReading = 1, ForWriting = 2;
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var template = fso.OpenTextFile("common_init_MsaterSalve.sh", ForReading);
		var tmp      = fso.OpenTextFile("common_init_MsaterSalve.tmp"+i+".sh", ForWriting, true);
		var contentTemplate = template.ReadAll();
		tmp.Write(contentTemplate.replace(/hostname=\sregistryHostname=\sapiserverHostname=\setcdHostname=/g,"hostname="+hostname[i]+"\n"+"registryHostname="+machineName[0].registryHostname+"\n"+"apiserverHostname="+machineName[0].apiserverHostname+"\n"+"etcdHostname="+machineName[0].etcdHostname+"\n"));
		template.Close();
		tmp     .Close();
		//���滻���ļ�ͨ��putty����Զ��ִ��
		var shell = WScript.CreateObject("WScript.Shell");
		//Ĭ��root�û�Ȩ��ֱ������
		shell.run("putty -m common_init_MsaterSalve.tmp"+i+".sh -pw " +pwd+ " root@" +machines[i].IP, 1, true);
		//WScript.Echo("445554"+machines[i].IP);
	}
  }
  
  //�����������ڵ�
  function only_init_master(){
    WScript.Echo("only_init_master");
	var ss = hostnames[0].hostname;
	var hostname = ss.split(" ");
	//�ļ��滻
	var ForReading = 1, ForWriting = 2;
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var template = fso.OpenTextFile("only_init_master.sh", ForReading);
	var tmp      = fso.OpenTextFile("only_init_master.tmp.sh", ForWriting, true);
	var contentTemplate = template.ReadAll();
	tmp.Write(contentTemplate.replace(/master_hostname=/g,"master_hostname="+machineName[0].master_hostname+"\n"));
	template.Close();
	tmp     .Close();
	//���滻���ļ�ͨ��putty����Զ��ִ��
	var shell = WScript.CreateObject("WScript.Shell");
	//Ĭ��root�û�Ȩ��ֱ������
	shell.run("putty -m only_init_master.tmp.sh -pw " +pwd+ " root@" +machines[0].IP, 1, true);
	//WScript.Echo("445554"+machines[i].IP);
  }
  //�������ôӽڵ�
  function only_init_salve(){
    WScript.Echo("only_init_salve");
	for(var i =1;i<machines.length;i++){
		//�ļ��滻
		var ForReading = 1, ForWriting = 2;
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var template = fso.OpenTextFile("only_init_salve.sh", ForReading);
		var tmp      = fso.OpenTextFile("only_init_salve.tmp"+i+".sh", ForWriting, true);
		var contentTemplate = template.ReadAll();
		tmp.Write(contentTemplate.replace(/KUBE_master_hostname=/g,"KUBE_master_hostname="+machineName[0].KUBE_master_hostname+"\n"));
		template.Close();
		tmp     .Close();
		//���滻���ļ�ͨ��putty����Զ��ִ��
		var shell = WScript.CreateObject("WScript.Shell");
		//Ĭ��root�û�Ȩ��ֱ������
		shell.run("putty -m only_init_salve.tmp"+i+".sh -pw " +pwd+ " root@" +machines[i].IP, 1, true);
		//WScript.Echo("445554"+machines[i].IP);
	}
  }
  //���ڵ���ӽڵ�����
  function start_docker_cloud(){
	WScript.Echo("start_docker_cloud");
	var shell = WScript.CreateObject("WScript.Shell");
	//Ĭ��root�û�Ȩ��ֱ������
	shell.run("putty -m setupMaster.sh -pw " +pwd+ " root@" +machines[0].IP, 1, true);
	for(var i =1;i<machines.length;i++){
		//���ļ�ͨ��putty����Զ��ִ��
		var shell = WScript.CreateObject("WScript.Shell");
		//Ĭ��root�û�Ȩ��ֱ������
		shell.run("putty -m setupSalve.sh -pw " +pwd+ " root@" +machines[i].IP, 1, true);
	}
  }
  //���registry���񱾵ؿ�
  function registry_init_update(){
	//���滻���ļ�ͨ��putty����Զ��ִ��
	var shell = WScript.CreateObject("WScript.Shell");
	//Ĭ��root�û�Ȩ��ֱ������
	shell.run("putty -m registry_init_update.sh -pw " +pwd+ " root@" +machineName[0].registryHostIP, 1, true); 
	start_docker_cloud();
  }
  //����dashboard skydns kubedns ����yaml�ļ�
  function dashboard_skydns_kubedns(){
	WScript.Echo("dashboard_skydns_kube-dns");
	//�ļ��滻
	var ForReading = 1, ForWriting = 2;
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var template = fso.OpenTextFile("dashboard_skydns_kubedns.sh", ForReading);
	var tmp      = fso.OpenTextFile("dashboard_skydns_kubedns.tmp.sh", ForWriting, true);
	var contentTemplate = template.ReadAll();
	tmp.Write(contentTemplate.replace(/registryHostname=\sapiserver_host=\skube_master_url=/g,"registryHostname="+machineName[0].registryHostname+"\n"+"apiserver_host="+machineName[0].apiserver_host+"\n"+"kube_master_url="+machineName[0].kube_master_url+"\n"));
	template.Close();
	tmp     .Close();
	//���滻���ļ�ͨ��putty����Զ��ִ��
	var shell = WScript.CreateObject("WScript.Shell");
	//Ĭ��root�û�Ȩ��ֱ������
	shell.run("putty -m dashboard_skydns_kubedns.tmp.sh -pw " +pwd+ " root@" +machines[0].IP, 1, true); 
	start_docker_cloud();
  }
  function IPandHostnameSetup(){
	  localHOSTS();
	  setupIPhostname();
	  clusterReboot();
	  WScript.Echo("���û�����������������е��ԣ�����������Լ�IPӳ��������Ч����ִ��One_button_loader���ܺ�����һ��װ��");
  }
  //���úú�һ��ʽװ��
  function One_button_loader(){
	  runningState();
	  common_init_MsaterSalve();
	  only_init_master();
	  only_init_salve();
	  start_docker_cloud();
	  registry_init_update();
	  dashboard_skydns_kubedns();
	  WScript.Echo("���ʧ�ܣ�������registry.access.redhat.com/rhel7/pod-infrastructure����˳�����أ�");
	  WScript.Echo("��ִ��registry_init_update����ִ��dashboard_skydns_kubedns��");
  }
  
  //������Ӧ
  return {
	  //�ű�����ִ��ʱ������Ҫ��ִ��localHOSTS����Ҳ��֪Ϊʲô��
	  localHOSTS:localHOSTS,
	  setupIPhostname:setupIPhostname,
	  runningState:runningState,
	  common_init_MsaterSalve:common_init_MsaterSalve,
	  only_init_master:only_init_master,
	  only_init_salve:only_init_salve,
	  start_docker_cloud:start_docker_cloud,
	  registry_init_update:registry_init_update,
	  dashboard_skydns_kubedns:dashboard_skydns_kubedns,
	  One_button_loader:One_button_loader,
	  testcheshi1:testcheshi1,
	  abc:null
  };
})();
/*main*/
(function main(){
	
	/*����Ĭ��ִ������
	
	cscript //h:cscript
	
	*/
	
	
	if(WScript.Arguments.length < 1) {
		WScript.Arguments.ShowUsage();
		WScript.Quit(1);
	}

	var para = [];
	for(var i=0; i<WScript.Arguments.Length; i++) 
		para.push(WScript.Arguments(i));
	para = para.join(" ");
	
	caculate(para);
	
})();