function caculate(formulation){
	var result = eval(formulation);
	WScript.Echo(formulation + " = " + result);
	return result;
}


var cloud = (function (){
  //����ڵ��IP��ַ
  var bushu_IP="172.16.2.1";
  var bushu_pwd="hadoop"
  
  //�ļ��� �������ļ��ϴ����ڵ㡱�µ��ļ�·��
  var files_Dir="/root/mysqltomcat"
  
  //��װhadoop
  function install_mysql_tomcat(){
	WScript.Echo("install_mysql_tomcat");
	//�ļ��滻
	var ForReading = 1, ForWriting = 2;
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var template = fso.OpenTextFile("mysql_tomcat.sh", ForReading);
	var tmp      = fso.OpenTextFile("mysql_tomcat.tmp.sh", ForWriting, true);
	var contentTemplate = template.ReadAll();
	tmp.Write(contentTemplate.replace(/files_Dir=/,"files_Dir="+files_Dir+"\n"));
	template.Close();
	tmp     .Close();
	//���滻���ļ�ͨ��putty����Զ��ִ��
	var shell = WScript.CreateObject("WScript.Shell");
	//Ĭ��root�û�Ȩ��ֱ������
	shell.run("putty -m mysql_tomcat.tmp.sh -pw " +bushu_pwd+ " root@" +bushu_IP, 1, true); 
  }
  
  //������Ӧ
  return {
	  install_mysql_tomcat:install_mysql_tomcat,
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