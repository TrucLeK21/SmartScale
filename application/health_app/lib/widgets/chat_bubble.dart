import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/models/message.dart';

class ChatBubble extends StatelessWidget {
  final Message message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8, // Max width 80%
        ),
        child: IntrinsicWidth(
          child: Container(
            padding: EdgeInsets.fromLTRB(20, 15, 20, 15),
            margin: EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: message.isUser ? AppColors.subColor : AppColors.lightGray,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Text(
              message.content,
              style: TextStyle(
                color: message.isUser ? Colors.white : Colors.black,
              ),
              textAlign: TextAlign.justify,
            ),
          ),
        ),
      ),
    );
  }
}
