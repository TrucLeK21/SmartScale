import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/providers/chat_provider.dart';
import 'package:health_app/widgets/chat_bubble.dart';
import 'package:provider/provider.dart';

class AiChatPage extends StatefulWidget {
  const AiChatPage({super.key});

  @override
  State<AiChatPage> createState() => _AiChatPageState();
}

class _AiChatPageState extends State<AiChatPage> {
  final _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  // @override
  // void initState() {
  //   super.initState();

  //   // Gửi prompt mặc định sau khi widget được khởi tạo
  //   WidgetsBinding.instance.addPostFrameCallback((_) {
  //     final chatProvider = context.read<ChatProvider>();
  //     if (chatProvider.messages.isEmpty) {
  //       chatProvider.sendMessage("Bạn hãy vào vai là một chuyên gia về dinh dưỡng, thể hình và sức khỏe tổng quát.chỉ trả lời ngắn gọn theo mẫu: 'Tôi là trợ lý sức khỏe thông minh, tôi có thể giúp gì cho bạn?'");
  //     }
  //   });
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.superLightGray,
        title: const Text(
          "Trợ lý sức khỏe",
        ),
        centerTitle: true,
        leading: BackButton(
          onPressed: () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text("Xác nhận"),
                content: const Text(
                    "Lịch sử trò chuyện sẽ bị xóa. Bạn có chắc chắn muốn quay lại?"),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text("Hủy"),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    child: const Text("Đồng ý"),
                  ),
                ],
              ),
            );

            if (confirm == true) {
              context.read<ChatProvider>().clearMessages();
              Navigator.of(context).pop(); // pop trang
            }
          },
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // TOP SECTION: Chat messages
            Expanded(
              child: Consumer<ChatProvider>(
                builder: (context, chatProvider, child) {
                  // Gọi scroll khi có tin nhắn mới
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    _scrollToBottom();
                  });
                  if (chatProvider.messages.isEmpty) {
                    return SingleChildScrollView(
                      child: Column(
                        children: [
                          const SizedBox(
                            height: 20,
                          ),
                          Wrap(
                            runSpacing: 20,
                            alignment: WrapAlignment.center,
                            children:
                                chatProvider.suggestions.map((suggestion) {
                              return GestureDetector(
                                onTap: () {
                                  chatProvider.sendMessage(suggestion.content);
                                },
                                child: Container(
                                  width:
                                      MediaQuery.of(context).size.width * 0.8,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(20),
                                    border:
                                        Border.all(color: Colors.blue.shade300),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Colors.black12,
                                        blurRadius: 4,
                                        offset: Offset(0, 2),
                                      )
                                    ],
                                  ),
                                  child: Text(
                                    suggestion.content,
                                    style: const TextStyle(
                                      color: Colors.blueAccent,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.builder(
                      controller: _scrollController,
                      itemCount: chatProvider.messages.length,
                      itemBuilder: (context, index) {
                        final message = chatProvider.messages[index];

                        return ChatBubble(
                          message: message,
                        );
                      });
                },
              ),
            ),

            // Loading indicator
            Consumer<ChatProvider>(
              builder: (context, chatProvider, child) {
                if (chatProvider.isLoading) {
                  return Container(
                      padding: EdgeInsets.fromLTRB(10, 10, 10, 5),
                      child: const CircularProgressIndicator());
                }
                return const SizedBox();
              },
            ),

            // USER INPUT BOX

            Row(
              children: [
                // Text input
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(
                        horizontal: 8.0, vertical: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: "Nhập tin nhắn...",
                        border: InputBorder.none,
                      ),
                      minLines: 1, // Minimum height (1 line)
                      maxLines: null, // No max height, so it expands as needed
                      onSubmitted: (_) {
                        _sendMessage();
                      },
                    ),
                  ),
                ),

                // Send button
                Container(
                  margin: const EdgeInsets.only(right: 10),
                  decoration: const BoxDecoration(
                    color: AppColors.subColor,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: () {
                      _sendMessage();
                    },
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  void _sendMessage() {
    if (_controller.text.trim().isNotEmpty) {
      final chatProvider = context.read<ChatProvider>();
      chatProvider.sendMessage(_controller.text.trim());
      _controller.clear();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
}
